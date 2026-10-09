import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { ATSAnalysisSchema, parseAndValidate } from "@/lib/ai/schemas";
import { analyzeAtsPrompt } from "@/lib/ai/prompts/analyze-ats";
import { buildATSResumeContext } from "@/lib/ai/ats-context";
import { sanitizeResumeData } from "@/lib/resume/validation";
import { hasResumeContent } from "@/lib/resume/guest-import";
import { getAIUserScope, withAICache } from "@/lib/ai/cache";
import { aiErrorResponse, invalidAIResponse } from "@/lib/ai/http-errors";
import { createHash } from "node:crypto";
import { applyDeterministicATSScore } from "@/lib/ai/deterministic-ats-score";

export const runtime = "nodejs";
export const maxDuration = 120;

const guestATSInFlight = new Set<string>();

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

  const userScope = await getAIUserScope();
  if (!userScope) {
    return errorResponse("We couldn't verify your session. Please refresh and try again.", 503);
  }
  const guestScope = userScope.startsWith("guest:") ? userScope : null;
  if (guestScope && request.cookies.get("guest_ats_analyzed")?.value === "1") {
    return errorResponse("Your free guest ATS analysis has already been used. Sign in to analyze again.", 403);
  }
  if (guestScope && guestATSInFlight.has(guestScope)) {
    return errorResponse("Your ATS analysis is already in progress.", 409);
  }
  if (guestScope) guestATSInFlight.add(guestScope);

  try {
  // The cache key and model both use the same minimal, ATS-relevant input.
  const resumeContext = buildATSResumeContext(safeResume);
  const input = { resume: resumeContext };
  // Include every ResumeData field in the cache identity without sending editor metadata
  // or direct contact values to the model.
  const cacheInput = { ...input, resumeHash: createHash("sha256").update(JSON.stringify(safeResume)).digest("hex") };
  const generate = () => generateAIResponse({
      systemPrompt: analyzeAtsPrompt,
      userPrompt: JSON.stringify(input),
      temperature: 0.2,
      maxTokens: 1300,
      jsonMode: true,
      operationName: "ATS Analysis",
    });
  const result = payload.force === true
    ? await generate()
    : await withAICache(
      userScope,
      "ats-analysis-v2",
      cacheInput,
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

  const scored = applyDeterministicATSScore(safeResume, validated.data);
  const response = NextResponse.json(
    { success: true, data: scored },
    { headers: { "Cache-Control": "no-store" } }
  );
  if (guestScope) {
    response.cookies.set("guest_ats_analyzed", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
  } finally {
    if (guestScope) guestATSInFlight.delete(guestScope);
  }
}
