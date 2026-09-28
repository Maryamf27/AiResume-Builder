import type { ResumeRecord } from "@/types/resume";
import { GUEST_RESUME_STORAGE_KEY } from "@/lib/resume/constants";
import { sanitizeResumeRecord } from "@/lib/resume/validation";


function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadGuestResume(): ResumeRecord | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(GUEST_RESUME_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return sanitizeResumeRecord(parsed);
  } catch {
    // Invalid JSON
    return null;
  }
}

export function saveGuestResume(record: ResumeRecord): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(GUEST_RESUME_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearGuestResume(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(GUEST_RESUME_STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
