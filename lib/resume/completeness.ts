import type { ResumeData } from "@/types/resume";

export function calculateCompleteness(data: ResumeData): number {
  const checks: boolean[] = [
    Boolean(data.personal.firstName.trim() && data.personal.lastName.trim()),
    Boolean(data.personal.title.trim()),
    Boolean(data.personal.email.trim() || data.personal.phone.trim()),
    Boolean(data.summary.trim().length > 0),
    Boolean(data.experience.length > 0 || data.education.length > 0),
    Boolean(data.skills.length > 0),
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
}
