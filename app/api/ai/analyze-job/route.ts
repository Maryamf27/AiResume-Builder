import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { JobAnalysisSchema, parseAndValidate } from "@/lib/ai/schemas";
import { analyzeJobPrompt } from "@/lib/ai/prompts/analyze-job";
import { createAITiming } from "@/lib/ai/timing";
import { getAIUserScope, withAICache } from "@/lib/ai/cache";
import { aiErrorResponse, invalidAIResponse } from "@/lib/ai/http-errors";

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
    timing.finish();
    return aiErrorResponse(result, "job analysis");
  }

  const validationStartedAt = performance.now();
  const validated = parseAndValidate(result.content, JobAnalysisSchema);
  timing.mark("schema validation", validationStartedAt);

  if (!validated.success) {
    timing.finish();
    return invalidAIResponse("job analysis", validated.error, Math.round(performance.now() - processingStartedAt));
  }

  timing.finish();
  return Response.json(
    { success: true, data: validated.data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
