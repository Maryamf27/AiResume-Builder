import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { ATSAnalysisSchema, parseAndValidate } from "@/lib/ai/schemas";
import { analyzeAtsPrompt } from "@/lib/ai/prompts/analyze-ats";
import { sanitizeResumeData } from "@/lib/resume/validation";
import { hasResumeContent } from "@/lib/resume/guest-import";
import { getAIUserScope, withAICache } from "@/lib/ai/cache";
import { aiErrorResponse, invalidAIResponse } from "@/lib/ai/http-errors";

export const runtime = "nodejs";
export const maxDuration = 120;

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

  const payload = (body ?? {}) as { resume?: unknown; force?: unknown };
  const resume = payload.resume ?? body;

  if (!resume || typeof resume !== "object") {
    return errorResponse("A valid resume payload is required for ATS analysis.", 400);
  }

  const safeResume = sanitizeResumeData(resume);
  if (!hasResumeContent(safeResume)) {
    return errorResponse("Your resume needs some content before ATS analysis.", 400);
  }

  const input = { resume: safeResume };
  const generate = () => generateAIResponse({
      systemPrompt: analyzeAtsPrompt,
      userPrompt: JSON.stringify(input),
      temperature: 0.2,
      // ATS reports contain several nested arrays; 2600 tokens can truncate
      // valid JSON for longer resumes, which then surfaces as INVALID_RESPONSE/502.
      maxTokens: 3500,
      jsonMode: true,
      operationName: "ATS Analysis",
    });
  const result = payload.force === true
    ? await generate()
    : await withAICache(
      await getAIUserScope(),
      "ats-analysis-v1",
      input,
      generate,
      (value) => value.success && parseAndValidate(value.content, ATSAnalysisSchema).success,
    );

  if (!result.success) {
    return aiErrorResponse(result, "ATS analysis");
  }

  const validated = parseAndValidate(result.content, ATSAnalysisSchema);
  if (!validated.success) {
    return invalidAIResponse("ATS analysis", validated.error, Math.round(performance.now() - requestStartedAt));
  }

  return Response.json(
    { success: true, data: validated.data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
