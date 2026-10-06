import type { ResumeData } from "@/types/resume";

function compactText(value: string, maxLength: number): string {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;
  const cut = normalized.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > maxLength * 0.8 ? lastSpace : maxLength).trimEnd()}…`;
}

/** Small, ATS-relevant input that excludes direct contact values and editor metadata. */
export function buildATSResumeContext(resume: ResumeData) {
  return {
    contact: {
      hasName: Boolean(`${resume.personal.firstName}${resume.personal.lastName}`.trim()),
      hasTitle: Boolean(resume.personal.title.trim()),
      hasEmail: Boolean(resume.personal.email.trim()),
      hasPhone: Boolean(resume.personal.phone.trim()),
      hasProfessionalLink: Boolean(resume.personal.website.trim() || resume.personal.linkedin.trim() || resume.personal.github.trim()),
    },
    summary: compactText(resume.summary, 1_000),
    experience: resume.experience.slice(0, 6).map(({ jobTitle, company, startDate, endDate, current, description }) => ({
      jobTitle: compactText(jobTitle, 120),
      company: compactText(company, 120),
      startDate, endDate, current,
      description: compactText(description, 1_200),
    })),
    education: resume.education.slice(0, 4).map(({ institution, degree, fieldOfStudy, startDate, endDate, description }) => ({
      institution: compactText(institution, 120),
      degree: compactText(degree, 120),
      fieldOfStudy: compactText(fieldOfStudy, 120),
      startDate, endDate,
      description: compactText(description, 400),
    })),
    skills: resume.skills.slice(0, 40).map(({ name }) => compactText(name, 100)),
    projects: resume.projects.slice(0, 5).map(({ name, description, technologies }) => ({
      name: compactText(name, 120),
      description: compactText(description, 600),
      technologies: compactText(technologies, 200),
    })),
    certifications: resume.certifications.slice(0, 8).map(({ name, organization }) => ({
      name: compactText(name, 120), organization: compactText(organization, 120),
    })),
    languages: resume.languages.slice(0, 8).map(({ language, proficiency }) => ({
      language: compactText(language, 80), proficiency: compactText(proficiency, 80),
    })),
  };
}
