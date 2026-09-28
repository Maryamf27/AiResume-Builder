import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  ProjectEntry,
  ResumeData,
  ResumeRecord,
  SkillEntry,
} from "@/types/resume";
import { createEmptyResumeData, DEFAULT_RESUME_TITLE, RESUME_SCHEMA_VERSION } from "@/lib/resume/constants";
import { createId } from "@/lib/resume/id";


function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function ensureId(value: unknown): string {
  return typeof value === "string" && value.trim().length > 0 ? value : createId();
}

function sanitizeArray<T>(raw: unknown, sanitizeItem: (item: unknown) => T | null): T[] {
  if (!Array.isArray(raw)) return [];
  const out: T[] = [];
  for (const item of raw) {
    const sanitized = sanitizeItem(item);
    if (sanitized) out.push(sanitized);
  }
  return out;
}

function sanitizeExperience(raw: unknown): ExperienceEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = asRecord(raw);
  return {
    id: ensureId(r.id),
    jobTitle: str(r.jobTitle),
    company: str(r.company),
    location: str(r.location),
    startDate: str(r.startDate),
    endDate: str(r.endDate),
    current: bool(r.current),
    description: str(r.description),
  };
}

function sanitizeEducation(raw: unknown): EducationEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = asRecord(raw);
  return {
    id: ensureId(r.id),
    institution: str(r.institution),
    degree: str(r.degree),
    fieldOfStudy: str(r.fieldOfStudy),
    startDate: str(r.startDate),
    endDate: str(r.endDate),
    description: str(r.description),
  };
}

function sanitizeSkill(raw: unknown): SkillEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = asRecord(raw);
  const name = str(r.name);
  if (!name.trim()) return null;
  return { id: ensureId(r.id), name };
}

function sanitizeProject(raw: unknown): ProjectEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = asRecord(raw);
  return {
    id: ensureId(r.id),
    name: str(r.name),
    description: str(r.description),
    url: str(r.url),
    technologies: str(r.technologies),
  };
}

function sanitizeCertification(raw: unknown): CertificationEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = asRecord(raw);
  return {
    id: ensureId(r.id),
    name: str(r.name),
    organization: str(r.organization),
    issueDate: str(r.issueDate),
    expirationDate: str(r.expirationDate),
    credentialUrl: str(r.credentialUrl),
  };
}

function sanitizeLanguage(raw: unknown): LanguageEntry | null {
  if (!raw || typeof raw !== "object") return null;
  const r = asRecord(raw);
  const language = str(r.language);
  if (!language.trim()) return null;
  return { id: ensureId(r.id), language, proficiency: str(r.proficiency, "Professional") };
}

export function sanitizeResumeData(raw: unknown): ResumeData {
  const empty = createEmptyResumeData();
  if (!raw || typeof raw !== "object") return empty;
  const r = asRecord(raw);
  const personal = asRecord(r.personal);

  return {
    personal: {
      firstName: str(personal.firstName),
      lastName: str(personal.lastName),
      title: str(personal.title),
      email: str(personal.email),
      phone: str(personal.phone),
      location: str(personal.location),
      website: str(personal.website),
      linkedin: str(personal.linkedin),
      github: str(personal.github),
    },
    summary: str(r.summary),
    experience: sanitizeArray(r.experience, sanitizeExperience),
    education: sanitizeArray(r.education, sanitizeEducation),
    skills: sanitizeArray(r.skills, sanitizeSkill),
    projects: sanitizeArray(r.projects, sanitizeProject),
    certifications: sanitizeArray(r.certifications, sanitizeCertification),
    languages: sanitizeArray(r.languages, sanitizeLanguage),
  };
}

export function sanitizeResumeRecord(raw: unknown): ResumeRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = asRecord(raw);
  if (typeof r.data === "undefined" || r.data === null) return null;

  const now = new Date().toISOString();
  return {
    id: ensureId(r.id),
    userId: typeof r.userId === "string" ? r.userId : null,
    title: str(r.title, DEFAULT_RESUME_TITLE),
    data: sanitizeResumeData(r.data),
    version: typeof r.version === "number" ? r.version : RESUME_SCHEMA_VERSION,
    createdAt: str(r.createdAt, now),
    updatedAt: str(r.updatedAt, now),
  };
}
