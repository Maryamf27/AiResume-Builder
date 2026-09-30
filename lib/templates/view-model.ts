import type { ResumeData } from "@/types/resume";


const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDate(value: string): string {
  const m = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(value.trim());
  if (!m) return value.trim();
  const month = Number(m[2]);
  if (month < 1 || month > 12) return value.trim();
  return `${MONTHS[month - 1]} ${m[1]}`;
}

function dateRange(start: string, end: string, current = false): string {
  const from = formatDate(start);
  const to = current ? "Present" : formatDate(end);
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

export function safeHref(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return "";
  return `https://${v}`;
}

function lines(text: string): { text: string }[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean)
    .map((t) => ({ text: t }));
}

export function buildTemplateView(data: ResumeData) {
  const p = data.personal;
  const fullName = [p.firstName, p.lastName].map((s) => s.trim()).filter(Boolean).join(" ");

  const contacts = [
    p.email && { label: "Email", value: p.email, href: `mailto:${p.email.trim()}` },
    p.phone && { label: "Phone", value: p.phone, href: "" },
    p.location && { label: "Location", value: p.location, href: "" },
    p.website && { label: "Website", value: p.website, href: safeHref(p.website) },
    p.linkedin && { label: "LinkedIn", value: p.linkedin, href: safeHref(p.linkedin) },
    p.github && { label: "GitHub", value: p.github, href: safeHref(p.github) },
  ].filter((c): c is { label: string; value: string; href: string } => Boolean(c));

  return {
    fullName,
    firstName: p.firstName,
    lastName: p.lastName,
    title: p.title,
    email: p.email,
    phone: p.phone,
    location: p.location,
    website: p.website,
    websiteHref: safeHref(p.website),
    linkedin: p.linkedin,
    linkedinHref: safeHref(p.linkedin),
    github: p.github,
    githubHref: safeHref(p.github),
    contacts,
    hasContacts: contacts.length > 0,

    summary: data.summary,
    hasSummary: data.summary.trim().length > 0,

    hasExperience: data.experience.length > 0,
    experience: data.experience.map((e) => ({
      jobTitle: e.jobTitle,
      company: e.company,
      location: e.location,
      dateRange: dateRange(e.startDate, e.endDate, e.current),
      current: e.current,
      description: e.description,
      descriptionLines: lines(e.description),
    })),

    hasEducation: data.education.length > 0,
    education: data.education.map((e) => ({
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      dateRange: dateRange(e.startDate, e.endDate),
      description: e.description,
      descriptionLines: lines(e.description),
    })),

    hasSkills: data.skills.length > 0,
    skills: data.skills.map((s) => ({ name: s.name })),
    skillsList: data.skills.map((s) => s.name).join(", "),

    hasProjects: data.projects.length > 0,
    projects: data.projects.map((pr) => ({
      name: pr.name,
      description: pr.description,
      descriptionLines: lines(pr.description),
      url: pr.url,
      href: safeHref(pr.url),
      technologies: pr.technologies,
    })),

    hasCertifications: data.certifications.length > 0,
    certifications: data.certifications.map((c) => ({
      name: c.name,
      organization: c.organization,
      issueDate: formatDate(c.issueDate),
      expirationDate: formatDate(c.expirationDate),
      dateRange: dateRange(c.issueDate, c.expirationDate),
      credentialUrl: c.credentialUrl,
      href: safeHref(c.credentialUrl),
    })),

    hasLanguages: data.languages.length > 0,
    languages: data.languages.map((l) => ({
      language: l.language,
      proficiency: l.proficiency,
    })),
  };
}

export type TemplateView = ReturnType<typeof buildTemplateView>;
