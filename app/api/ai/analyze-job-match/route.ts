import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { withAICache, getAIUserScope } from "@/lib/ai/cache";
import { JobMatchAnalysisSchema, parseAndValidate, ResumeDataSchema } from "@/lib/ai/schemas";
import { analyzeJobMatchPrompt } from "@/lib/ai/prompts/analyze-job-match";
import { hasResumeContent } from "@/lib/resume/guest-import";
import { sanitizeResumeData } from "@/lib/resume/validation";
import { buildAIResumeContext, MAX_AI_RESUME_CONTEXT_LENGTH } from "@/lib/ai/resume-context";
import type { AIError } from "@/lib/ai/types";
import { aiErrorResponse, invalidAIResponse } from "@/lib/ai/http-errors";

export const runtime = "nodejs";
export const maxDuration = 120;
const MIN_JOB_DESCRIPTION_LENGTH = 80;
const MAX_JOB_DESCRIPTION_LENGTH = 20_000;

function errorResponse(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest): Promise<Response> {
  const requestStartedAt = performance.now();
  let body: unknown;
  try { body = await request.json(); } catch { return errorResponse("Request body must be valid JSON.", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse("A resume and job description are required.", 400);

  const payload = body as Record<string, unknown>;
  const resumeResult = ResumeDataSchema.safeParse(payload.resume);
  if (!resumeResult.success) return errorResponse("A valid resume payload is required.", 400);
  const resume = sanitizeResumeData(resumeResult.data);
  if (!hasResumeContent(resume)) return errorResponse("Your resume needs some content before job matching.", 400);

  const jobDescription = typeof payload.jobDescription === "string" ? payload.jobDescription.trim() : "";
  if (jobDescription.length < MIN_JOB_DESCRIPTION_LENGTH) return errorResponse("Please provide a more complete job description.", 400);
  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) return errorResponse("This job description is too long. Please shorten it and try again.", 400);

  const resumeContext = buildAIResumeContext(resume);
  if (JSON.stringify(resumeContext).length > MAX_AI_RESUME_CONTEXT_LENGTH) return errorResponse("Your resume is too large to analyze in one request. Shorten long descriptions and try again.", 413);

  const input = { resume: resumeContext, jobDescription };
  const generate = () => generateAIResponse({
      systemPrompt: analyzeJobMatchPrompt,
      userPrompt: JSON.stringify(input),
      temperature: 0.2,
      maxTokens: 6500,
      jsonMode: true,
      operationName: "Combined Job Analysis and Match",
      signal: request.signal,
    });
  const result = payload.force === true
    ? await generate()
    : await withAICache(
      await getAIUserScope(),
      "job-match-v1",
      input,
      generate,
      (value) => value.success && parseAndValidate(value.content, JobMatchAnalysisSchema).success,
    );

  if (!result.success) return aiErrorResponse(result as AIError, "Job analysis and match");
  const validated = parseAndValidate(result.content, JobMatchAnalysisSchema);
  if (!validated.success) {
    return invalidAIResponse("Job analysis and match", validated.error, Math.round(performance.now() - requestStartedAt));
  }
  return Response.json({ success: true, data: validated.data }, { headers: { "Cache-Control": "no-store" } });
}
