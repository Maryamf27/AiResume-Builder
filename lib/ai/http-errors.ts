import type { AIError } from "@/lib/ai/types";

export function aiErrorResponse(error: AIError, operation: string): Response {
  const status = error.code === "INVALID_CONFIG" ? 401
    : error.code === "INSUFFICIENT_CREDITS" ? 402
      : error.code === "INVALID_REQUEST" ? 400
        : error.code === "RATE_LIMIT" || error.code === "PROVIDER_RATE_LIMIT" || error.code === "QUOTA_EXHAUSTED" ? 429
          : error.code === "TIMEOUT" ? 504
            : error.code === "MISSING_API_KEY" || error.code === "MODEL_UNAVAILABLE" || error.code === "PROVIDER_ERROR" ? 503
              : 502;

  const message = error.code === "INVALID_CONFIG" || error.code === "MISSING_API_KEY"
    ? "AI configuration error. Please contact support."
    : error.code === "INSUFFICIENT_CREDITS"
      ? "AI usage limit or credits have been reached. Please try again later."
      : error.code === "INVALID_REQUEST"
        ? "AI request could not be processed. Please check the request."
        : error.code === "RATE_LIMIT" || error.code === "PROVIDER_RATE_LIMIT"
          ? "AI service is temporarily rate limited. Please try again shortly."
          : error.code === "QUOTA_EXHAUSTED"
            ? "The free AI model's daily limit has been reached. Please try again later."
            : error.code === "MODEL_UNAVAILABLE"
              ? "The configured AI model is currently unavailable. Please try again later."
              : error.code === "TIMEOUT"
                ? "AI request timed out. Please try again."
                : error.code === "INVALID_RESPONSE"
                  ? "AI returned an incomplete or unexpected response. Please try again."
                  : `The AI provider is temporarily unavailable for ${operation.toLowerCase()}. Please try again.`;

  return Response.json({ success: false, code: error.code, error: message }, { status });
}

export function invalidAIResponse(operation: string, diagnostics: unknown, durationMs?: number): Response {
  console.error("AI_RESPONSE_VALIDATION_ERROR", { operation, diagnostics, durationMs });
  return Response.json({
    success: false,
    code: "INVALID_RESPONSE",
    error: "AI returned data in an unexpected format. Please retry the operation.",
  }, { status: 502 });
}
