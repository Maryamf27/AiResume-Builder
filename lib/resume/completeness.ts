import type { ResumeData } from "@/types/resume";

const WEIGHTS = {
  personal: 25,
  summary: 15,
  experience: 20,
  education: 15,
  skills: 15,
  projects: 5,
  certifications: 3,
  languages: 2,
} as const;

export function calculateCompleteness(data: ResumeData): number {
  const p = data.personal;

  const personalChecks = [
    Boolean(p.firstName.trim() && p.lastName.trim()),
    Boolean(p.title.trim()),
    Boolean(p.email.trim() || p.phone.trim()),
  ];
  const personalRatio = personalChecks.filter(Boolean).length / personalChecks.length;

  const score =
    WEIGHTS.personal * personalRatio +
    (data.summary.trim().length > 0 ? WEIGHTS.summary : 0) +
    (data.experience.length > 0 ? WEIGHTS.experience : 0) +
    (data.education.length > 0 ? WEIGHTS.education : 0) +
    (data.skills.length > 0 ? WEIGHTS.skills : 0) +
    (data.projects.length > 0 ? WEIGHTS.projects : 0) +
    (data.certifications.length > 0 ? WEIGHTS.certifications : 0) +
    (data.languages.length > 0 ? WEIGHTS.languages : 0);

  return Math.round(score);
}