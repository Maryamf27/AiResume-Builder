import type { ResumeData } from "@/types/resume";
import { createEmptyResumeData } from "@/lib/resume/constants";
import { loadGuestResume } from "@/lib/resume/storage";

export function hasResumeContent(data: ResumeData): boolean {
  return (
    JSON.stringify({ ...data, templateId: "" }) !== JSON.stringify(createEmptyResumeData())
  );
}

export function hasGuestResumeToImport(): boolean {
  const guest = loadGuestResume();
  return guest !== null && hasResumeContent(guest.data);
}
