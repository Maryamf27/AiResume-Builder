import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { AIHealthResponseSchema, parseAndValidate } from "@/lib/ai/schemas";
import type { AIError } from "@/lib/ai/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { message } = (body ?? {}) as { message?: string };
  if (!message || typeof message !== "string" || !message.trim()) {
    return Response.json(
      { success: false, error: "A non-empty \"message\" field is required." },
      { status: 400 }
    );
  }

  const result = await generateAIResponse({
    systemPrompt:
      "You are a helpful assistant. Reply with ONLY a valid JSON object " +
      "matching this exact shape: {\"success\": true, \"message\": \"<your reply>\"}. " +
      "Do not include any other text, markdown, or code fences.",
    userPrompt: message.trim(),
    temperature: 0.3,
    maxTokens: 200,
    jsonMode: true,
  });

  if (!result.success) {
    const err = result as AIError;
    const status =
      err.code === "MISSING_API_KEY" || err.code === "INVALID_CONFIG" || err.code === "INSUFFICIENT_CREDITS" || err.code === "MODEL_UNAVAILABLE"
        ? 503
        : err.code === "RATE_LIMIT" || err.code === "PROVIDER_RATE_LIMIT" || err.code === "QUOTA_EXHAUSTED"
          ? 429
          : err.code === "TIMEOUT"
            ? 504
            : err.code === "INVALID_REQUEST"
              ? 400
              : 502;

    return Response.json(
      { success: false, error: err.message },
      { status }
    );
  }

  const validated = parseAndValidate(result.content, AIHealthResponseSchema);

  if (!validated.success) {
    return Response.json(
      { success: false, error: "AI response validation failed. Please try again." },
      { status: 502 }
    );
  }

  return Response.json(validated.data, {
    headers: { "Cache-Control": "no-store" },
  });
}
