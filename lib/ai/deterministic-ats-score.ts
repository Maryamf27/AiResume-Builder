import type { ResumeData } from "@/types/resume";

type ScoredCategory = { id: string; name: string; score: number; status: "excellent" | "good" | "needs_improvement" | "poor"; summary: string };
type ATSResult = { overallScore: number; summary: string; categories: ScoredCategory[] };

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const nonEmpty = (value: string) => value.trim().length > 0;
const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;
const quantified = (value: string) => /(?:\b\d+(?:\.\d+)?\s?%|\b\d+(?:\.\d+)?\s?(?:ms|seconds?|minutes?|hours?|days?|weeks?|months?|years?|users?|customers?|requests?|records?|dollars?|\$|x)\b|\b(?:increased|decreased|reduced|improved|grew|saved|cut)\b[^.\n]{0,60}\bby\s+\d+)/i.test(value);

function categoryFor(id: string, name: string): keyof ReturnType<typeof calculate> | null {
  const value = `${id} ${name}`.toLowerCase().replace(/[^a-z]/g, "");
  if (value.includes("contact")) return "contact";
  if (value.includes("coverage") || value.includes("section")) return "coverage";
  if (value.includes("impact") || value.includes("evidence")) return "impact";
  if (value.includes("clarity")) return "clarity";
  if (value.includes("keyword")) return "keywords";
  if (value.includes("structure")) return "structure";
  return null;
}

function calculate(resume: ResumeData) {
  const p = resume.personal;
  const contactFields = [
    Boolean(`${p.firstName}${p.lastName}`.trim()), nonEmpty(p.title), nonEmpty(p.email),
    nonEmpty(p.phone), nonEmpty(p.location), Boolean(p.website.trim() || p.linkedin.trim() || p.github.trim()),
  ];
  const contact = clamp(contactFields.filter(Boolean).length / contactFields.length * 100);

  const sections = [nonEmpty(resume.summary), resume.experience.some((x) => nonEmpty(x.jobTitle) || nonEmpty(x.description)),
    resume.education.some((x) => nonEmpty(x.institution) || nonEmpty(x.degree)), resume.skills.some((x) => nonEmpty(x.name)),
    resume.projects.some((x) => nonEmpty(x.name) || nonEmpty(x.description)),
    resume.certifications.some((x) => nonEmpty(x.name)) || resume.languages.some((x) => nonEmpty(x.language))];
  const educationRows = resume.education.filter((x) => nonEmpty(x.institution) || nonEmpty(x.degree));
  const educationDateCoverage = educationRows.length
    ? educationRows.reduce((sum, row) => sum + Number(nonEmpty(row.startDate)) + Number(nonEmpty(row.endDate)), 0) / (educationRows.length * 2)
    : 0;
  const coverage = clamp(sections.filter(Boolean).length / sections.length * 85 + educationDateCoverage * 15);

  const narratives = [...resume.experience.map((x) => x.description), ...resume.projects.map((x) => x.description)].filter(nonEmpty);
  const impactRate = narratives.length ? narratives.filter(quantified).length / narratives.length : 0;
  const actionRate = narratives.length ? narratives.filter((text) => /\b(built|led|created|developed|designed|delivered|implemented|launched|optimized|reduced|improved|managed|automated|analyzed|increased)\b/i.test(text)).length / narratives.length : 0;
  const impact = clamp((narratives.length ? 35 : 0) + actionRate * 25 + impactRate * 40);

  const narrativeText = [resume.summary, ...narratives].filter(nonEmpty);
  const averageWords = narrativeText.length ? narrativeText.reduce((sum, text) => sum + wordCount(text), 0) / narrativeText.length : 0;
  const clarity = clamp((narrativeText.length ? 60 : 25) + (averageWords >= 8 && averageWords <= 100 ? 20 : 0) + (narratives.some((text) => text.includes("\n") || /[.!?]/.test(text)) ? 20 : 0));

  const skillCount = resume.skills.filter((x) => nonEmpty(x.name)).length;
  const techCount = resume.projects.filter((x) => nonEmpty(x.technologies)).length;
  const keywords = clamp(Math.min(skillCount, 8) / 8 * 70 + Math.min(techCount, 3) / 3 * 30);

  const datedRows = [...resume.experience.map((x) => ({ start: x.startDate, end: x.current ? "current" : x.endDate })), ...resume.education.map((x) => ({ start: x.startDate, end: x.endDate }))]
    .filter((x) => nonEmpty(x.start) || nonEmpty(x.end));
  const dateCompleteness = datedRows.length ? datedRows.reduce((sum, row) => sum + Number(nonEmpty(row.start)) + Number(nonEmpty(row.end)), 0) / (datedRows.length * 2) : 0;
  const structure = clamp(55 + (sections.filter(Boolean).length / sections.length) * 30 + dateCompleteness * 15);

  return { structure, contact, coverage, clarity, impact, keywords };
}

function status(score: number): ScoredCategory["status"] {
  return score >= 90 ? "excellent" : score >= 75 ? "good" : score >= 60 ? "needs_improvement" : "poor";
}

/** Keep explanatory text from the AI, while deriving score values consistently from ResumeData. */
export function applyDeterministicATSScore<T extends ATSResult>(resume: ResumeData, result: T): T {
  const scores = calculate(resume);
  const weights: Record<keyof typeof scores, number> = { structure: 15, contact: 20, coverage: 20, clarity: 15, impact: 20, keywords: 10 };
  const labels: Record<keyof typeof scores, string> = { structure: "Structure", contact: "Contact Info", coverage: "Section Coverage", clarity: "Clarity", impact: "Evidence of Impact", keywords: "Keyword Density" };
  const summaries: Record<keyof typeof scores, string> = {
    structure: "Based on section completeness and dated entries.",
    contact: "Based on name, title, contact details, location, and professional links.",
    coverage: "Based on completed resume sections and education dates.",
    clarity: "Based on the presence and length of resume narrative text.",
    impact: "Based on action language and quantified outcomes in experience and projects.",
    keywords: "Based on listed skills and project technologies.",
  };
  const keys = Object.keys(scores) as (keyof typeof scores)[];
  const categories = keys.map((key) => {
    const score = scores[key];
    return { id: key, name: labels[key], score, status: status(score), summary: summaries[key] };
  });
  const totalWeight = keys.reduce((sum, key) => sum + weights[key], 0);
  const weightedTotal = keys.reduce((sum, key) => sum + scores[key] * weights[key], 0);
  const overallScore = clamp(weightedTotal / totalWeight);
  return {
    ...result,
    categories,
    overallScore,
    summary: `Your ATS readiness score is ${overallScore}%, calculated from resume structure, contact details, section coverage, clarity, evidence of impact, and keywords.`,
  };
}
