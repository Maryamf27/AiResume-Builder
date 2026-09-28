import type { ResumeData } from "@/types/resume";
import { createEmptyResumeData } from "@/lib/resume/constants";
import { loadGuestResume } from "@/lib/resume/storage";

/** True when the resume has at least one field filled in. */
export function hasResumeContent(data: ResumeData): boolean {
  return JSON.stringify(data) !== JSON.stringify(createEmptyResumeData());
}

/** True when this device holds a guest resume worth moving into an account. */
export function hasGuestResumeToImport(): boolean {
  const guest = loadGuestResume();
  return guest !== null && hasResumeContent(guest.data);
}