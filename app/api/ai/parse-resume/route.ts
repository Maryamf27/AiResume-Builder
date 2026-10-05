import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { parseResumePrompt } from "@/lib/ai/prompts/parse-resume";
import { parseResumeData } from "@/lib/ai/schemas";
import type { AIError } from "@/lib/ai/types";

export const runtime = "nodejs";

const MAX_RESUME_TEXT_LENGTH = 200_000;

function errorResponse(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const { text } = (body ?? {}) as { text?: unknown };
  if (typeof text !== "string") {
    return errorResponse("A resume text payload is required.", 400);
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return errorResponse("The extracted resume text is empty.", 400);
  }

  if (trimmed.length > MAX_RESUME_TEXT_LENGTH) {
    return errorResponse(
      "This resume is too long to import automatically. Please choose a shorter document or enter your information manually.",
      413
    );
  }

  const result = await generateAIResponse({
    systemPrompt: parseResumePrompt,
    userPrompt: `Extract structured ResumeData from the following resume text.\n\n${trimmed}`,
    temperature: 0.1,
    maxTokens: 2500,
    jsonMode: true,
  });

  if (!result.success) {
    const err = result as AIError;
    const status =
      err.code === "MISSING_API_KEY" || err.code === "INVALID_CONFIG"
        ? 503
        : err.code === "RATE_LIMIT"
          ? 429
          : err.code === "TIMEOUT"
            ? 504
            : err.code === "INVALID_REQUEST"
              ? 400
              : 502;

    return errorResponse(err.message, status);
  }

  const validated = parseResumeData(result.content);
  if (!validated.success) {
    return errorResponse("We couldn't parse this resume reliably. Please try again or enter your information manually.", 502);
  }

  return Response.json(
    { success: true, data: validated.data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
