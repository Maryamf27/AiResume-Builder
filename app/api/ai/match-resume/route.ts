import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { matchResumePrompt } from "@/lib/ai/prompts/match-resume";
import {
  JobAnalysisSchema,
  MatchAnalysisSchema,
  parseAndValidate,
  ResumeDataSchema,
} from "@/lib/ai/schemas";
import type { AIError } from "@/lib/ai/types";
import { hasResumeContent } from "@/lib/resume/guest-import";
import { sanitizeResumeData } from "@/lib/resume/validation";
import type { JobAnalysis } from "@/lib/ai/schemas";
import {
  buildAIResumeContext,
  MAX_AI_RESUME_CONTEXT_LENGTH,
} from "@/lib/ai/resume-context";
import { createAITiming } from "@/lib/ai/timing";
import { getAIUserScope, withAICache } from "@/lib/ai/cache";

export const runtime = "nodejs";

function errorResponse(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status });
}

function hasJobRequirements(job: JobAnalysis): boolean {
  return Boolean(
    job.jobTitle ||
      job.experienceRequirements.length ||
      job.educationRequirements.length ||
      job.requiredSkills.length ||
      job.preferredSkills.length ||
      job.responsibilities.length ||
      job.requiredQualifications.length ||
      job.preferredQualifications.length ||
      job.keywords.length ||
      job.softSkills.length ||
      job.toolsAndTechnologies.length ||
      job.certifications.length
  );
}

function aiErrorResponse(error: AIError): Response {
  const status =
    error.code === "MISSING_API_KEY" || error.code === "INVALID_CONFIG" || error.code === "INSUFFICIENT_CREDITS" || error.code === "MODEL_UNAVAILABLE"
      ? 503
      : error.code === "RATE_LIMIT" || error.code === "PROVIDER_RATE_LIMIT" || error.code === "QUOTA_EXHAUSTED"
        ? 429
        : error.code === "TIMEOUT"
          ? 504
          : error.code === "INVALID_REQUEST"
            ? 400
            : 502;

  const message =
    error.code === "QUOTA_EXHAUSTED"
      ? error.message
      : error.code === "RATE_LIMIT"
      ? error.message
      : error.code === "PROVIDER_RATE_LIMIT"
      ? error.message
      : error.code === "TIMEOUT"
        ? "The match analysis timed out. Please try again."
        : error.code === "PROVIDER_ERROR"
          ? "AI service is temporarily unavailable. Please try again later."
          : "We couldn't safely calculate the match. Please try again.";

  return errorResponse(message, status);
}

export async function POST(request: NextRequest): Promise<Response> {
  const timing = createAITiming("Job Match");
  const processingStartedAt = performance.now();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("A resume and job analysis are required.", 400);
  }

  const payload = body as Record<string, unknown>;
  const resumeResult = ResumeDataSchema.safeParse(payload.resume);
  if (!resumeResult.success) {
    return errorResponse("A valid resume payload is required for match analysis.", 400);
  }

  const resume = sanitizeResumeData(resumeResult.data);
  if (!hasResumeContent(resume)) {
    return errorResponse("Your resume needs some content before match analysis.", 400);
  }

  const jobResult = JobAnalysisSchema.safeParse(payload.job);
  if (!jobResult.success || !hasJobRequirements(jobResult.data)) {
    return errorResponse("A valid, non-empty job analysis is required.", 400);
  }

  const resumeContext = buildAIResumeContext(resume);
  const resumeJson = JSON.stringify(resumeContext);
  if (resumeJson.length > MAX_AI_RESUME_CONTEXT_LENGTH) {
    return errorResponse("Your resume is too large to analyze in one request. Shorten long descriptions and try again.", 413);
  }

  timing.mark("resume retrieval and job processing", processingStartedAt);
  timing.mark("database operations (none; resume supplied)", performance.now());
  const input = { resume: resumeContext, job: jobResult.data };
  const result = await withAICache(
    await getAIUserScope(),
    "match-resume-v1",
    input,
    () => generateAIResponse({
      systemPrompt: matchResumePrompt,
      userPrompt: JSON.stringify(input),
      temperature: 0.2,
      maxTokens: 6000,
      jsonMode: true,
      operationName: "Job Match",
      signal: request.signal,
    }),
    (value) => value.success && parseAndValidate(value.content, MatchAnalysisSchema).success,
  );

  if (!result.success) {
    timing.finish();
    return aiErrorResponse(result as AIError);
  }

  const validationStartedAt = performance.now();
  const validated = parseAndValidate(result.content, MatchAnalysisSchema);
  timing.mark("schema validation", validationStartedAt);
  if (!validated.success) {
    console.error("[Resume Match] AI response failed schema validation.", validated.error);
    timing.finish();
    return errorResponse("We couldn't safely calculate the match. Please try again.", 502);
  }

  timing.finish();
  return Response.json(
    { success: true, data: validated.data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
