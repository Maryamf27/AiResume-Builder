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
const REQUEST_TIMEOUT_MS = 30_000;
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
  options: AIRequestOptions
): Promise<AIResponse | AIError> {
  const baseBody: Record<string, unknown> = {
    model,
    messages,
  };

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

  const requestStartedAt = performance.now();

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
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let res: Response;
      let json: unknown;
      let unreadableResponse = false;

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
          json = await res.json();
        } catch {
          unreadableResponse = res.ok;
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return aiError("TIMEOUT", "AI request timed out. Please try again.");
        }
        console.error("[AI Client] Network error communicating with AI provider.");
        return aiError("PROVIDER_ERROR", "Unable to reach the AI service. Please try again later.");
      } finally {
        clearTimeout(timer);
        options.signal?.removeEventListener("abort", abortFromRequest);
        if (options.operationName && process.env.NODE_ENV === "development") {
          console.info(
            `[AI TIMING] ${options.operationName} OpenRouter request: ${(performance.now() - requestStartedAt).toFixed(0)}ms`
          );
        }
      }

      if (unreadableResponse) {
        return aiError("INVALID_RESPONSE", "AI service returned an unreadable response.");
      }

      if (!res.ok) {
        const internalReason = providerErrorText(json)
          .slice(0, 180)
          .replace(/sk-or-v1-[a-z0-9]+/gi, "[redacted]");
        const categorized = classifyProviderError(res.status, json);
        if (categorized && categorized.code !== "RATE_LIMIT") {
          console.error("[AI Client] AI provider rejected the request.", {
            model,
            status: res.status,
            code: categorized.code,
            reason: internalReason,
          });
          return categorized;
        }

        if ((isTransientProviderStatus(res.status) || res.status === 429) && transientRetries < MAX_TRANSIENT_RETRIES) {
          const delayMs = getRetryDelayMs(res, transientRetries);
          if (delayMs !== null) {
            console.warn("[AI Client] AI provider is temporarily unavailable; retrying request.", {
              model,
              status: res.status,
              retry: transientRetries + 1,
              delayMs,
              reason: internalReason,
            });
            transientRetries += 1;
            if (await waitForRetry(delayMs, options.signal)) continue;
            return aiError("PROVIDER_ERROR", "AI request was cancelled.");
          }
        }

        if (res.status === 429) {
          return categorized ?? aiError("RATE_LIMIT", "AI service is temporarily busy. Please wait before trying again.");
        }

        console.error("[AI Client] AI provider returned an error.", { model, status: res.status, reason: internalReason });
        return aiError("PROVIDER_ERROR", "AI service is temporarily unavailable. Please try again later.");
      }

      if (!json || typeof json !== "object") {
        return aiError("INVALID_RESPONSE", "AI service returned an unreadable response.");
      }

      const data = json as Record<string, unknown>;
      const choices = data.choices as Array<Record<string, unknown>> | undefined;
      const firstChoice = choices?.[0];
      const messageObj = firstChoice?.message as Record<string, unknown> | undefined;
      const content = typeof messageObj?.content === "string" ? messageObj.content : "";

      if (!content.trim()) {
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
  if (!options.systemPrompt?.trim() || !options.userPrompt?.trim()) {
    return aiError("INVALID_REQUEST", "Both system prompt and user prompt are required.");
  }

  const config = resolveConfig();
  if ("success" in config && config.success === false) {
    return config;
  }

  const { apiKey, model, baseUrl } = config as AIConfig;
  const messages: { role: string; content: string }[] = [
    { role: "system", content: options.systemPrompt },
    { role: "user", content: options.userPrompt },
  ];

  return requestModelChat(baseUrl, apiKey, model, messages, options);
}
