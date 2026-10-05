import type { ResumeData } from "@/types/resume";

export const MAX_AI_RESUME_CONTEXT_LENGTH = 100_000;

export function buildAIResumeContext(resume: ResumeData) {
  return {
    personal: { title: resume.personal.title },
    summary: resume.summary,
    experience: resume.experience,
    education: resume.education,
    skills: resume.skills,
    projects: resume.projects,
  };
}
