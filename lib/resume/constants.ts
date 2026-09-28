import {
  UserRound,
  FileText,
  BriefcaseBusiness,
  GraduationCap,
  Wrench,
  FolderKanban,
  Award,
  Languages as LanguagesIcon,
  type LucideIcon,
} from "lucide-react";
import type { ResumeData, ResumeRecord, ResumeSectionId } from "@/types/resume";
import { createId } from "@/lib/resume/id";

export const RESUME_SCHEMA_VERSION = 1;

export const DEFAULT_RESUME_TITLE = "My Resume";

export function createEmptyResumeData(): ResumeData {
  return {
    personal: {
      firstName: "",
      lastName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    templateId: "",
  };
}

export function createEmptyResumeRecord(userId: string | null = null): ResumeRecord {
  const now = new Date().toISOString();
  return {
    id: createId(),
    userId,
    title: DEFAULT_RESUME_TITLE,
    data: createEmptyResumeData(),
    version: RESUME_SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
  };
}

export interface ResumeSectionMeta {
  id: ResumeSectionId;
  label: string;
  icon: LucideIcon;
}

export const resumeSections: ResumeSectionMeta[] = [
  { id: "personal", label: "Personal Information", icon: UserRound },
  { id: "summary", label: "Professional Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: BriefcaseBusiness },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "languages", label: "Languages", icon: LanguagesIcon },
];

export const proficiencyLevels = [
  "Native",
  "Fluent",
  "Professional",
  "Conversational",
  "Basic",
] as const;

export const GUEST_RESUME_STORAGE_KEY = "resume-builder:guest";

