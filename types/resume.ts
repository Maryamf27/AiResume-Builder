export interface PersonalInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
}

export interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SkillEntry {
  id: string;
  name: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  url: string;
  technologies: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  expirationDate: string;
  credentialUrl: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  languages: LanguageEntry[];
}
export type ResumeArrayField =
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages";

export type ResumeSectionId =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages";

export interface ResumeRecord {
  id: string;
  userId: string | null;
  title: string;
  data: ResumeData;
  version: number;
  createdAt: string;
  updatedAt: string;
}
