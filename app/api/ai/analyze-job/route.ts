import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { JobAnalysisSchema, parseAndValidate } from "@/lib/ai/schemas";
import { analyzeJobPrompt } from "@/lib/ai/prompts/analyze-job";
import type { AIError } from "@/lib/ai/types";
import { createAITiming } from "@/lib/ai/timing";
import { getAIUserScope, withAICache } from "@/lib/ai/cache";

export const runtime = "nodejs";

const MAX_JOB_DESCRIPTION_LENGTH = 20000;
const MIN_JOB_DESCRIPTION_LENGTH = 80;

function errorResponse(message: string, status: number): Response {
  return Response.json({ success: false, error: message }, { status });
}

export async function POST(request: NextRequest): Promise<Response> {
  const timing = createAITiming("Job Analysis");
  const processingStartedAt = performance.now();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Request body must be valid JSON.", 400);
  }

  const payload = (body ?? {}) as { jobDescription?: unknown };
  const rawDescription = typeof payload.jobDescription === "string" ? payload.jobDescription : "";
  const jobDescription = rawDescription.trim();

  if (!jobDescription) {
    return errorResponse("Please paste a job description before analyzing.", 400);
  }

  if (jobDescription.length < MIN_JOB_DESCRIPTION_LENGTH) {
    return errorResponse("Please provide a more complete job description.", 400);
  }

  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    return errorResponse("This job description is too long. Please shorten it and try again.", 400);
  }

  timing.mark("job processing", processingStartedAt);
  timing.mark("database operations (none)", performance.now());

  const input = { jobDescription };
  const result = await withAICache(
    await getAIUserScope(),
    "job-analysis-v1",
    input,
    () => generateAIResponse({
      systemPrompt: analyzeJobPrompt,
      userPrompt: JSON.stringify(input),
      temperature: 0.2,
      maxTokens: 5000,
      jsonMode: true,
      operationName: "Job Analysis",
      signal: request.signal,
    }),
    (value) => value.success && parseAndValidate(value.content, JobAnalysisSchema).success,
  );

  if (!result.success) {
    const err = result as AIError;
    timing.finish();
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

    const friendlyMessage =
      err.code === "QUOTA_EXHAUSTED"
        ? err.message
        : err.code === "RATE_LIMIT"
        ? err.message
        : err.code === "PROVIDER_RATE_LIMIT"
          ? err.message
        : err.code === "INSUFFICIENT_CREDITS" || err.code === "MODEL_UNAVAILABLE"
          ? err.message
        : err.code === "TIMEOUT"
          ? "The job analysis timed out. Please try again."
          : err.code === "PROVIDER_ERROR"
            ? "AI service is temporarily unavailable. Please try again later."
            : "We couldn't safely analyze this job description. Please try again.";

    return errorResponse(friendlyMessage, status);
  }

  const validationStartedAt = performance.now();
  const validated = parseAndValidate(result.content, JobAnalysisSchema);
  timing.mark("schema validation", validationStartedAt);

  if (!validated.success) {
    console.error("[Job Analysis] AI response failed schema validation.", validated.error);
    timing.finish();
    return errorResponse("We couldn't safely analyze this job description. Please try again.", 502);
  }

  timing.finish();
  return Response.json(
    { success: true, data: validated.data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
