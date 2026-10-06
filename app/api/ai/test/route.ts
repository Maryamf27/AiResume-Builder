import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { AIHealthResponseSchema, parseAndValidate } from "@/lib/ai/schemas";
import { aiErrorResponse, invalidAIResponse } from "@/lib/ai/http-errors";

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
    operationName: "AI Health Check",
  });

  if (!result.success) {
    return aiErrorResponse(result, "AI health check");
  }

  const validated = parseAndValidate(result.content, AIHealthResponseSchema);

  if (!validated.success) {
    return invalidAIResponse("AI health check", validated.error);
  }

  return Response.json(validated.data, {
    headers: { "Cache-Control": "no-store" },
  });
}
