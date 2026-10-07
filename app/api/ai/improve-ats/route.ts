import { NextRequest } from "next/server";
import { generateAIResponse } from "@/lib/ai/client";
import { ATSAnalysisSchema, ATSImprovementPlanSchema, parseAndValidate, ResumeDataSchema } from "@/lib/ai/schemas";
import { improveAtsPrompt } from "@/lib/ai/prompts/improve-ats";
import { buildATSResumeContext } from "@/lib/ai/ats-context";
import { sanitizeResumeData } from "@/lib/resume/validation";
import { aiErrorResponse, invalidAIResponse } from "@/lib/ai/http-errors";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest): Promise<Response> {
  const started = performance.now();
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ success: false, error: "Please try again." }, { status: 400 }); }
  const payload = body as { resume?: unknown; analysis?: unknown };
  const resumeParsed = ResumeDataSchema.safeParse(payload?.resume);
  const analysisParsed = ATSAnalysisSchema.safeParse(payload?.analysis);
  if (!resumeParsed.success || !analysisParsed.success) return Response.json({ success: false, error: "Refresh the ATS review and try again." }, { status: 400 });
  const resume = sanitizeResumeData(resumeParsed.data);
  const resumeContext = buildATSResumeContext(resume);
  const plannerResumeContext = {
    ...resumeContext,
    education: resumeContext.education.map((entry, index) => ({ ...entry, id: resume.education[index]?.id ?? "" })),
    experience: resumeContext.experience.map((entry, index) => ({ ...entry, id: resume.experience[index]?.id ?? "" })),
    projects: resumeContext.projects.map((entry, index) => ({ ...entry, id: resume.projects[index]?.id ?? "" })),
  };
  const result = await generateAIResponse({
    systemPrompt: improveAtsPrompt,
    userPrompt: JSON.stringify({ resume: plannerResumeContext, ats: analysisParsed.data }),
    temperature: 0.1,
    maxTokens: 900,
    jsonMode: true,
    operationName: "ATS Improvement Plan",
  });
  if (!result.success) return aiErrorResponse(result, "ATS improvement plan");
  const validated = parseAndValidate(result.content, ATSImprovementPlanSchema);
  if (!validated.success) return invalidAIResponse("ATS improvement plan", validated.error, Math.round(performance.now() - started));
 
  const allowed = validated.data.improvements.filter((item) => {
    const p = resume.personal as unknown as Record<string, string>;
    if (item.section === "personal") return item.itemId === null && item.field in p && !p[item.field]?.trim() && item.currentValue === "";
    if (!item.itemId) return false;
    const row = item.section === "education" ? resume.education.find((x) => x.id === item.itemId)
      : item.section === "experience" ? resume.experience.find((x) => x.id === item.itemId)
      : resume.projects.find((x) => x.id === item.itemId);
    if (item.section === "projects" && item.field === "description") {
      const hasImpactIssue = analysisParsed.data.categories.some((category) => /impact/i.test(`${category.id} ${category.name}`) && category.score < 80)
        || analysisParsed.data.issues.some((issue) => /impact/i.test(`${issue.id} ${issue.category} ${issue.title}`));
      return Boolean(row && hasImpactIssue && (row as typeof resume.projects[number]).description === item.currentValue && item.currentValue.trim());
    }
    return Boolean(row && item.field in row && !(row as unknown as Record<string, unknown>)[item.field] && item.currentValue === "");
  });
  const response = ATSImprovementPlanSchema.safeParse({ ...validated.data, improvements: allowed });
  if (!response.success) return invalidAIResponse("ATS improvement plan response", response.error.issues, Math.round(performance.now() - started));
  return Response.json(response.data, { headers: { "Cache-Control": "no-store" } });
}
