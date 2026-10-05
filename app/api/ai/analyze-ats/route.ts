import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { ATSAnalysisSchema, parseAndValidate } from "@/lib/ai/schemas";
import { analyzeAtsPrompt } from "@/lib/ai/prompts/analyze-ats";
import { sanitizeResumeData } from "@/lib/resume/validation";
import { hasResumeContent } from "@/lib/resume/guest-import";
import type { AIError } from "@/lib/ai/types";

export const runtime = "nodejs";

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

  const payload = (body ?? {}) as { resume?: unknown };
  const resume = payload.resume ?? body;

  if (!resume || typeof resume !== "object") {
    return errorResponse("A valid resume payload is required for ATS analysis.", 400);
  }

  const safeResume = sanitizeResumeData(resume);
  if (!hasResumeContent(safeResume)) {
    return errorResponse("Your resume needs some content before ATS analysis.", 400);
  }

  const result = await generateAIResponse({
    systemPrompt: analyzeAtsPrompt,
    userPrompt: JSON.stringify({ resume: safeResume }, null, 2),
    temperature: 0.2,
    maxTokens: 2600,
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

    const friendlyMessage =
      err.code === "RATE_LIMIT"
        ? "AI service is temporarily rate-limited. Please try again shortly."
        : err.code === "TIMEOUT"
          ? "The ATS analysis timed out. Please try again."
          : "We couldn't safely process the ATS analysis. Please try again.";

    return errorResponse(friendlyMessage, status);
  }

  const validated = parseAndValidate(result.content, ATSAnalysisSchema);
  if (!validated.success) {
    return errorResponse("We couldn't safely process the ATS analysis. Please try again.", 502);
  }

  return Response.json(
    { success: true, data: validated.data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
