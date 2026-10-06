import type {
  AIConfig,
  AIRequestOptions,
  AIResponse,
  AIError,
  AIResult,
  AIErrorCode,
} from "./types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "openrouter/free";
// Free models routinely take 30-90s to emit a structured JSON report, so the
// old 30s cap was aborting healthy requests. Override with OPENROUTER_TIMEOUT_MS.
const DEFAULT_REQUEST_TIMEOUT_MS = 100_000;

function resolveTimeoutMs(options: AIRequestOptions): number {
  if (options.timeoutMs && options.timeoutMs > 0) return options.timeoutMs;
  const fromEnv = Number(process.env.OPENROUTER_TIMEOUT_MS);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : DEFAULT_REQUEST_TIMEOUT_MS;
}

// OpenRouter may prefix a non-streaming body with keep-alive whitespace or SSE
// comment lines (": OPENROUTER PROCESSING"). Parse tolerantly before giving up.
function parseProviderBody(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .split(/\r?\n/)
      .filter((line) => !line.trimStart().startsWith(":"))
      .join("\n")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const first = cleaned.indexOf("{");
      const last = cleaned.lastIndexOf("}");
      if (first !== -1 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
      throw new Error("unparseable");
    }
  }
}

function fallbackModels(primary: string): string[] {
  return (process.env.OPENROUTER_FALLBACK_MODELS || "")
    .split(",")
    .map((m) => m.trim())
    .filter((m) => m && m !== primary);
}
const MAX_TRANSIENT_RETRIES = 1;
const BASE_RETRY_DELAY_MS = 700;
const MAX_AUTOMATIC_RETRY_DELAY_MS = 3_000;

function isTransientProviderStatus(status: number): boolean {
  return status === 408 || status >= 500;
}

function getRetryDelayMs(response: Response, retry: number): number | null {
  const retryAfter = response.headers.get("Retry-After");
  if (!retryAfter) return Math.min(BASE_RETRY_DELAY_MS * 2 ** retry, MAX_AUTOMATIC_RETRY_DELAY_MS);

  const seconds = Number(retryAfter);
  const retryAt = Number.isFinite(seconds)
    ? Date.now() + seconds * 1_000
    : Date.parse(retryAfter);
  const delay = retryAt - Date.now();

  if (!Number.isFinite(delay)) return Math.min(BASE_RETRY_DELAY_MS * 2 ** retry, MAX_AUTOMATIC_RETRY_DELAY_MS);
  // Never retry before the provider's requested delay. Long waits are returned to the caller.
  if (delay > MAX_AUTOMATIC_RETRY_DELAY_MS) return null;
  return Math.max(0, delay);
}

function providerErrorText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const root = value as Record<string, unknown>;
  const error = root.error && typeof root.error === "object" ? root.error as Record<string, unknown> : root;
  const metadata = error.metadata && typeof error.metadata === "object"
    ? error.metadata as Record<string, unknown>
    : {};
  return [error.code, error.message, error.metadata && typeof error.metadata === "object"
    ? metadata.raw
    : ""]
    .concat(typeof metadata.provider_name === "string" ? [metadata.provider_name] : [])
    .filter((part): part is string => typeof part === "string")
    .join(" ")
    .toLowerCase();
}

function providerErrorFields(value: unknown): { code: string | number | null; message: string | null; provider: string } {
  if (!value || typeof value !== "object") return { code: null, message: null, provider: "openrouter" };
  const root = value as Record<string, unknown>;
  const error = root.error && typeof root.error === "object" ? root.error as Record<string, unknown> : root;
  const metadata = error.metadata && typeof error.metadata === "object"
    ? error.metadata as Record<string, unknown>
    : {};
  return {
    code: typeof error.code === "string" || typeof error.code === "number" ? error.code : null,
    message: typeof error.message === "string" ? error.message.slice(0, 300) : null,
    provider: typeof metadata.provider_name === "string" ? metadata.provider_name.slice(0, 80) : "openrouter",
  };
}

function classifyProviderError(status: number, value: unknown): AIError | null {
  const details = providerErrorText(value);
  if (status === 401 || status === 403) {
    return aiError("INVALID_CONFIG", "AI service authentication failed. Check the server configuration.");
  }
  if (status === 402 || /insufficient[_ -]credits|not enough credits|payment required/.test(details)) {
    return aiError("INSUFFICIENT_CREDITS", "AI service credits are unavailable. Please try again later.");
  }
  if (status === 404 || /model[_ -]not[_ -]found|no provider found|model unavailable/.test(details)) {
    return aiError("MODEL_UNAVAILABLE", "The configured AI model is unavailable. Please try again later.");
  }
  if (status === 429 && /free.model.*(daily|day)|daily.*(limit|quota)|quota.*(exhaust|exceed)|rate_limit_exceeded.*free/.test(details)) {
    return aiError("QUOTA_EXHAUSTED", "The free AI model's daily limit has been reached. Please try again later.");
  }
  if (status === 429 && /provider.*(rate.?limit|too many)|upstream.*(rate.?limit|429)/.test(details)) {
    return aiError("PROVIDER_RATE_LIMIT", "The selected AI provider is temporarily rate-limited. Please wait before trying again.");
  }
  if (status === 429) {
    return aiError("RATE_LIMIT", "AI service is temporarily busy. Please wait before trying again.");
  }
  if (status === 408) {
    return aiError("TIMEOUT", "AI request timed out. Please try again.");
  }
  if (status === 400) {
    return aiError("INVALID_REQUEST", "AI request could not be processed. Please check the request.");
  }
  return null;
}

function waitForRetry(delayMs: number, signal?: AbortSignal): Promise<boolean> {
  if (signal?.aborted) return Promise.resolve(false);

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve(true);
    }, delayMs);
    const abort = () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
      resolve(false);
    };
    signal?.addEventListener("abort", abort, { once: true });
  });
}

function resolveConfig(): AIConfig | AIError {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return {
      success: false,
      code: "MISSING_API_KEY",
      message: "AI service is not configured. Please set the OPENROUTER_API_KEY environment variable.",
    };
  }

  const model = (process.env.OPENROUTER_MODEL || DEFAULT_MODEL).trim();
  if (!model) {
    return {
      success: false,
      code: "INVALID_CONFIG",
      message: "AI model is not configured correctly.",
    };
  }

  return {
    apiKey,
    model,
    baseUrl: OPENROUTER_BASE_URL,
  };
}

function aiError(code: AIErrorCode, message: string): AIError {
  return { success: false, code, message };
}

async function requestModelChat(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  options: AIRequestOptions,
  requestStartedAt: number,
): Promise<AIResponse | AIError> {
  const baseBody: Record<string, unknown> = {
    model,
    messages,
  };

  const fallbacks = fallbackModels(model);
  if (fallbacks.length > 0) {
    baseBody.models = [model, ...fallbacks];
  }

  if (options.temperature !== undefined) {
    baseBody.temperature = options.temperature;
  }

  if (options.maxTokens !== undefined) {
    baseBody.max_tokens = options.maxTokens;
  }

  const requestBodies: Array<Record<string, unknown>> = [];

  if (options.jsonMode) {
    requestBodies.push({
      ...baseBody,
      response_format: { type: "json_object" },
    });
  } else {
    requestBodies.push(baseBody);
  }

  const operation = options.operationName || "AI request";

  for (let bodyIndex = 0; bodyIndex < requestBodies.length; bodyIndex += 1) {
    let transientRetries = 0;

    while (true) {
      const body = requestBodies[bodyIndex];
      const controller = new AbortController();
      const abortFromRequest = () => controller.abort(options.signal?.reason);
      if (options.signal?.aborted) {
        return aiError("PROVIDER_ERROR", "AI request was cancelled.");
      }
      options.signal?.addEventListener("abort", abortFromRequest, { once: true });
      const timer = setTimeout(() => controller.abort(), resolveTimeoutMs(options));

      let res: Response;
      let json: unknown;
      let unreadableResponse = false;
      let bodySnippet = "";
      let timedOutReadingBody = false;

      try {
        res = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + apiKey,
            "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            "X-Title": "Resume Builder",
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        try {
          const responseText = await res.text();
          bodySnippet = responseText.slice(0, 200).replace(/\s+/g, " ");
          json = parseProviderBody(responseText);
        } catch {
          // An abort while reading the body is a timeout, not a bad provider response.
          if (controller.signal.aborted) timedOutReadingBody = true;
          else unreadableResponse = true;
        }
      } catch (error: unknown) {
        const code = error instanceof DOMException && error.name === "AbortError" ? "TIMEOUT" : "PROVIDER_ERROR";
        console.error("AI_REQUEST_ERROR", {
          operation,
          model,
          status: null,
          provider: "openrouter",
          errorCode: code,
          errorMessage: code === "TIMEOUT" ? "Upstream request timed out" : "Network error communicating with OpenRouter",
          durationMs: Math.round(performance.now() - requestStartedAt),
          retryCount: transientRetries,
        });
        if (error instanceof DOMException && error.name === "AbortError") {
          return aiError("TIMEOUT", "AI request timed out. Please try again.");
        }
        return aiError("PROVIDER_ERROR", "Unable to reach the AI service. Please try again later.");
      } finally {
        clearTimeout(timer);
        options.signal?.removeEventListener("abort", abortFromRequest);
      }

      if (timedOutReadingBody) {
        if (options.signal?.aborted) return aiError("PROVIDER_ERROR", "AI request was cancelled.");
        console.error("AI_REQUEST_ERROR", {
          operation,
          model,
          status: res.status,
          provider: "openrouter",
          errorCode: "TIMEOUT",
          openRouterErrorMessage: "Timed out while waiting for the model to finish generating",
          durationMs: Math.round(performance.now() - requestStartedAt),
          retryCount: transientRetries,
        });
        // Do not retry: the model was too slow, and a retry would just double the wait.
        return aiError("TIMEOUT", "The AI model took too long to respond. Please try again.");
      }

      const fields = providerErrorFields(json);
      console.info("AI_REQUEST_RESULT", {
        operation,
        model,
        status: res.status,
        durationMs: Math.round(performance.now() - requestStartedAt),
        retryCount: transientRetries,
        provider: fields.provider,
      });

      if (unreadableResponse && res.ok) {
        console.error("AI_REQUEST_ERROR", {
          operation,
          model,
          status: res.status,
          contentType: res.headers.get("content-type"),
          provider: fields.provider,
          errorCode: "PROVIDER_ERROR",
          openRouterErrorCode: null,
          openRouterErrorMessage: "Provider returned a non-JSON response",
          bodySnippet: bodySnippet.replace(/sk-or-v1-[a-z0-9]+/gi, "[redacted]"),
          durationMs: Math.round(performance.now() - requestStartedAt),
          retryCount: transientRetries,
          retried: transientRetries > 0,
        });
        // Gateways and upstream providers sometimes return an HTML error page
        // with HTTP 200. Retry once, then report a temporary provider failure.
        if (transientRetries < MAX_TRANSIENT_RETRIES) {
          const retryDelay = getRetryDelayMs(res, transientRetries);
          if (retryDelay !== null) {
            transientRetries += 1;
            if (await waitForRetry(retryDelay, options.signal)) continue;
            return aiError("PROVIDER_ERROR", "AI request was cancelled.");
          }
        }
        return aiError("PROVIDER_ERROR", "AI service is temporarily unavailable. Please try again later.");
      }

      if (!res.ok) {
        const categorized = classifyProviderError(res.status, json);
        const isRetryableRateLimit = categorized?.code === "RATE_LIMIT" || categorized?.code === "PROVIDER_RATE_LIMIT";
        const retryDelay = (isTransientProviderStatus(res.status) || isRetryableRateLimit) && transientRetries < MAX_TRANSIENT_RETRIES
          ? getRetryDelayMs(res, transientRetries)
          : null;
        const willRetry = retryDelay !== null;
        console.error("AI_REQUEST_ERROR", {
          operation,
          model,
          status: res.status,
          provider: fields.provider,
          errorCode: categorized?.code ?? (res.status >= 500 ? "PROVIDER_ERROR" : "OPENROUTER_ERROR"),
          openRouterErrorCode: fields.code,
          openRouterErrorMessage: fields.message
            ?.replace(apiKey, "[redacted]")
            .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
            .replace(/sk-or-v1-[a-z0-9]+/gi, "[redacted]")
            .slice(0, 300),
          durationMs: Math.round(performance.now() - requestStartedAt),
          retryCount: transientRetries,
          retried: transientRetries > 0,
          willRetry,
        });
        if (categorized && !isRetryableRateLimit) {
          return categorized;
        }

        if (willRetry && retryDelay !== null) {
            console.warn("[AI Client] AI provider is temporarily unavailable; retrying request.", {
              model,
              status: res.status,
              retry: transientRetries + 1,
              delayMs: retryDelay,
            });
            transientRetries += 1;
            if (await waitForRetry(retryDelay, options.signal)) continue;
            return aiError("PROVIDER_ERROR", "AI request was cancelled.");
        }

        if (res.status === 429) {
          return categorized ?? aiError("RATE_LIMIT", "AI service is temporarily busy. Please wait before trying again.");
        }

        return aiError("PROVIDER_ERROR", "AI service is temporarily unavailable. Please try again later.");
      }

      if (!json || typeof json !== "object") {
        console.error("AI_REQUEST_ERROR", {
          operation,
          model,
          status: res.status,
          provider: fields.provider,
          errorCode: "INVALID_RESPONSE",
          openRouterErrorCode: null,
          openRouterErrorMessage: "Response body was not a JSON object",
          durationMs: Math.round(performance.now() - requestStartedAt),
          retryCount: transientRetries,
          retried: transientRetries > 0,
        });
        return aiError("INVALID_RESPONSE", "AI service returned an unreadable response.");
      }

      const data = json as Record<string, unknown>;
      const choices = data.choices as Array<Record<string, unknown>> | undefined;
      const firstChoice = choices?.[0];
      const messageObj = firstChoice?.message as Record<string, unknown> | undefined;
      const content = typeof messageObj?.content === "string" ? messageObj.content : "";

      if (firstChoice?.finish_reason === "length") {
        console.error("AI_REQUEST_ERROR", {
          operation,
          model,
          status: res.status,
          provider: fields.provider,
          errorCode: "INVALID_RESPONSE",
          openRouterErrorCode: null,
          openRouterErrorMessage: "Completion reached the configured output-token limit",
          durationMs: Math.round(performance.now() - requestStartedAt),
          retryCount: transientRetries,
          retried: transientRetries > 0,
        });
        return aiError("INVALID_RESPONSE", "AI response was incomplete because it reached the output limit. Please shorten the input and try again.");
      }

      if (!content.trim()) {
        console.error("AI_REQUEST_ERROR", {
          operation,
          model,
          status: res.status,
          provider: fields.provider,
          errorCode: "INVALID_RESPONSE",
          openRouterErrorCode: null,
          openRouterErrorMessage: "Provider returned an empty completion",
          durationMs: Math.round(performance.now() - requestStartedAt),
          retryCount: transientRetries,
          retried: transientRetries > 0,
        });
        return aiError("INVALID_RESPONSE", "AI returned an empty response. Please try again.");
      }

      const usageObj = data.usage as Record<string, number> | undefined;
      const usage = usageObj
        ? {
            promptTokens: usageObj.prompt_tokens ?? 0,
            completionTokens: usageObj.completion_tokens ?? 0,
            totalTokens: usageObj.total_tokens ?? 0,
          }
        : undefined;

      console.info("AI_REQUEST_SUCCESS", {
        operation,
        model,
        status: res.status,
        durationMs: Math.round(performance.now() - requestStartedAt),
        retryCount: transientRetries,
        retried: transientRetries > 0,
        provider: fields.provider,
      });

      return {
        success: true,
        content: content.trim(),
        model: (data.model as string) ?? model,
        usage,
      };
    }
  }

  return aiError("PROVIDER_ERROR", "AI service is temporarily unavailable. Please try again later.");
}

export async function generateAIResponse(
  options: AIRequestOptions
): Promise<AIResult> {
  const operation = options.operationName || "AI request";
  const requestStartedAt = performance.now();
  const configuredModel = process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL;
  console.info("AI_REQUEST_START", {
    operation,
    model: configuredModel,
    timestamp: new Date().toISOString(),
  });

  if (!options.systemPrompt?.trim() || !options.userPrompt?.trim()) {
    console.error("AI_REQUEST_ERROR", {
      operation,
      model: configuredModel,
      status: null,
      provider: "openrouter",
      errorCode: "INVALID_REQUEST",
      durationMs: Math.round(performance.now() - requestStartedAt),
      retryCount: 0,
    });
    return aiError("INVALID_REQUEST", "Both system prompt and user prompt are required.");
  }

  const config = resolveConfig();
  if ("success" in config && config.success === false) {
    console.error("AI_REQUEST_ERROR", {
      operation,
      model: configuredModel,
      status: null,
      provider: "openrouter",
      errorCode: config.code,
      durationMs: Math.round(performance.now() - requestStartedAt),
      retryCount: 0,
    });
    return config;
  }

  const { apiKey, model, baseUrl } = config as AIConfig;
  const messages: { role: string; content: string }[] = [
    { role: "system", content: options.systemPrompt },
    { role: "user", content: options.userPrompt },
  ];

  return requestModelChat(baseUrl, apiKey, model, messages, options, requestStartedAt);
}
