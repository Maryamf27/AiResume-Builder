import type { ResumeData } from "@/types/resume";
import { createEmptyResumeData } from "@/lib/resume/constants";
import { loadGuestResume } from "@/lib/resume/storage";

function hasMeaningfulString(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/** True when the resume has at least one field filled in. */
export function hasResumeContent(data: ResumeData): boolean {
  if (!data || typeof data !== "object") return false;

  const personal = data.personal ?? createEmptyResumeData().personal;
  if (
    [
      personal.firstName,
      personal.lastName,
      personal.title,
      personal.email,
      personal.phone,
      personal.location,
      personal.website,
      personal.linkedin,
      personal.github,
    ].some(hasMeaningfulString)
  ) {
    return true;
  }

  if (hasMeaningfulString(data.summary)) return true;

  if (data.experience.some((item) =>
    item &&
    (item.current ||
      [item.jobTitle, item.company, item.location, item.startDate, item.endDate, item.description].some(
        hasMeaningfulString
      ))
  )) {
    return true;
  }

  if (data.education.some((item) =>
    item &&
    [item.institution, item.degree, item.fieldOfStudy, item.startDate, item.endDate, item.description].some(
      hasMeaningfulString
    )
  )) {
    return true;
  }

  if (data.skills.some((item) => item && hasMeaningfulString(item.name))) return true;

  if (data.projects.some((item) =>
    item &&
    [item.name, item.description, item.url, item.technologies].some(hasMeaningfulString)
  )) {
    return true;
  }

  if (data.certifications.some((item) =>
    item &&
    [item.name, item.organization, item.issueDate, item.expirationDate, item.credentialUrl].some(
      hasMeaningfulString
    )
  )) {
    return true;
  }

  if (data.languages.some((item) => item && hasMeaningfulString(item.language))) return true;

  return false;
}

export function shouldPersistResumeDraft(
  data: ResumeData,
  title: string | null | undefined,
  hasPersistedRecord = false
): boolean {
  const trimmedTitle = typeof title === "string" ? title.trim() : "";

  if (hasPersistedRecord) {
    return true;
  }

  if (!hasResumeContent(data)) {
    return false;
  }

  // Builder titles are metadata, not resume content.
  return trimmedTitle !== "" || hasResumeContent(data);
}

/** True when this device holds a guest resume worth moving into an account. */
export function hasGuestResumeToImport(): boolean {
  const guest = loadGuestResume();
  return guest !== null && hasResumeContent(guest.data);
}
