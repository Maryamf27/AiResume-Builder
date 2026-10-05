import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { tailorResumePrompt } from "@/lib/ai/prompts/tailor-resume";
import {
  ATSAnalysisSchema,
  JobAnalysisSchema,
  MatchAnalysisSchema,
  parseAndValidate,
  ResumeDataSchema,
  TailoringAnalysisSchema,
  type TailoringAnalysis,
} from "@/lib/ai/schemas";
import type { AIError } from "@/lib/ai/types";
import { hasResumeContent } from "@/lib/resume/guest-import";
import { sanitizeResumeData } from "@/lib/resume/validation";
import type { ResumeData } from "@/types/resume";
import {
  buildAIResumeContext,
  MAX_AI_RESUME_CONTEXT_LENGTH,
} from "@/lib/ai/resume-context";
import { createAITiming } from "@/lib/ai/timing";

export const runtime = "nodejs";

function errorResponse(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status });
}

function aiErrorResponse(error: AIError): Response {
  const status =
    error.code === "MISSING_API_KEY" || error.code === "INVALID_CONFIG"
      ? 503
      : error.code === "RATE_LIMIT"
        ? 429
        : error.code === "TIMEOUT"
          ? 504
          : error.code === "INVALID_REQUEST"
            ? 400
            : 502;
  const message =
    error.code === "RATE_LIMIT"
      ? "AI service is temporarily busy. Please try again."
      : error.code === "TIMEOUT"
        ? "Resume tailoring timed out. Please try again."
        : error.code === "PROVIDER_ERROR"
          ? "AI service is temporarily unavailable. Please try again later."
          : "We couldn't safely generate tailoring suggestions. Please try again.";
  return errorResponse(message, status);
}

function readCurrentValue(
  resume: ResumeData,
  change: TailoringAnalysis["changes"][number]
): string | null {
  if (change.section === "summary") {
    return change.itemId === null && change.field === "summary" ? resume.summary : null;
  }
  if (!change.itemId) return null;

  if (change.section === "experience" && change.field === "description") {
    return resume.experience.find((entry) => entry.id === change.itemId)?.description ?? null;
  }
  if (change.section === "projects") {
    const project = resume.projects.find((entry) => entry.id === change.itemId);
    if (change.field === "description") return project?.description ?? null;
    if (change.field === "technologies") return project?.technologies ?? null;
  }
  if (change.section === "education" && change.field === "description") {
    return resume.education.find((entry) => entry.id === change.itemId)?.description ?? null;
  }
  return null;
}

function keepResumeGroundedChanges(
  analysis: TailoringAnalysis,
  resume: ResumeData
): TailoringAnalysis {
  const changes = analysis.changes.filter((change) => {
    const actualValue = readCurrentValue(resume, change);
    return change.supportedByResume && actualValue !== null && change.currentValue === actualValue;
  });
  const removedCount = analysis.changes.length - changes.length;

  return {
    ...analysis,
    changes,
    warnings:
      removedCount > 0
        ? [...analysis.warnings, `${removedCount} proposed text change${removedCount === 1 ? " was" : "s were"} omitted because resume support or source field could not be verified.`]
        : analysis.warnings,
  };
}

export async function POST(request: NextRequest): Promise<Response> {
  const timing = createAITiming("Resume Tailoring");
  const processingStartedAt = performance.now();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return errorResponse("Resume, job, and match analysis are required.", 400);
  }

  const payload = body as Record<string, unknown>;
  const resumeResult = ResumeDataSchema.safeParse(payload.resume);
  if (!resumeResult.success) {
    return errorResponse("A valid resume payload is required for tailoring.", 400);
  }
  const resume = sanitizeResumeData(resumeResult.data);
  if (!hasResumeContent(resume)) {
    return errorResponse("Your resume needs some content before tailoring suggestions can be generated.", 400);
  }

  const jobResult = JobAnalysisSchema.safeParse(payload.job);
  if (!jobResult.success) {
    return errorResponse("A valid job analysis is required for tailoring.", 400);
  }
  const matchResult = MatchAnalysisSchema.safeParse(payload.match);
  if (!matchResult.success) {
    return errorResponse("A valid resume-job match analysis is required for tailoring.", 400);
  }

  let ats: unknown = null;
  if (payload.ats !== undefined && payload.ats !== null) {
    const atsResult = ATSAnalysisSchema.safeParse(payload.ats);
    if (!atsResult.success) {
      return errorResponse("The ATS analysis is invalid. Re-run the ATS analysis and try again.", 400);
    }
    ats = atsResult.data;
  }

  const resumeContext = buildAIResumeContext(resume);
  const resumeJson = JSON.stringify(resumeContext);
  if (resumeJson.length > MAX_AI_RESUME_CONTEXT_LENGTH) {
    return errorResponse("Your resume is too large to tailor in one request. Shorten long descriptions and try again.", 413);
  }

  timing.mark("resume retrieval and job/match processing", processingStartedAt);
  timing.mark("database operations (none; inputs supplied)", performance.now());
  const result = await generateAIResponse({
    systemPrompt: tailorResumePrompt,
    userPrompt: JSON.stringify({
      resume: resumeContext,
      job: jobResult.data,
      match: matchResult.data,
      ...(ats ? { ats } : {}),
    }),
    temperature: 0.2,
    maxTokens: 5000,
    jsonMode: true,
    operationName: "Resume Tailoring",
    signal: request.signal,
  });

  if (!result.success) {
    timing.finish();
    return aiErrorResponse(result as AIError);
  }

  const validationStartedAt = performance.now();
  const validated = parseAndValidate(result.content, TailoringAnalysisSchema);
  timing.mark("schema validation", validationStartedAt);
  if (!validated.success) {
    console.error("[Resume Tailoring] AI response failed schema validation.", validated.error);
    timing.finish();
    return errorResponse("We couldn't safely generate tailoring suggestions. Please try again.", 502);
  }

  const safeAnalysis = keepResumeGroundedChanges(validated.data, resume);
  timing.finish();
  return Response.json(
    { success: true, data: safeAnalysis },
    { headers: { "Cache-Control": "no-store" } }
  );
}
