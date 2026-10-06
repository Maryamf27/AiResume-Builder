import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { parseResumePrompt } from "@/lib/ai/prompts/parse-resume";
import { parseResumeData } from "@/lib/ai/schemas";
import { getAIUserScope, withAICache } from "@/lib/ai/cache";
import { aiErrorResponse, invalidAIResponse } from "@/lib/ai/http-errors";

export const runtime = "nodejs";

const MAX_RESUME_TEXT_LENGTH = 200_000;

function errorResponse(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest): Promise<Response> {
  const requestStartedAt = performance.now();
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

  const input = { text: trimmed };
  const result = await withAICache(
    await getAIUserScope(),
    "parse-resume-v1",
    input,
    () => generateAIResponse({
      systemPrompt: parseResumePrompt,
      userPrompt: `Extract structured ResumeData from the following resume text:\n\n${trimmed}`,
      temperature: 0.1,
      maxTokens: 2500,
      jsonMode: true,
      operationName: "Resume Parsing",
    }),
    (value) => value.success && parseResumeData(value.content).success,
  );

  if (!result.success) {
    return aiErrorResponse(result, "resume parsing");
  }

  const validated = parseResumeData(result.content);
  if (!validated.success) {
    return invalidAIResponse("resume parsing", validated.error, Math.round(performance.now() - requestStartedAt));
  }

  return Response.json(
    { success: true, data: validated.data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
