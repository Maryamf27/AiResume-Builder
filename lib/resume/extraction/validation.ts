import type { ResumeFileType } from "@/lib/resume/extraction/types";

export const MAX_RESUME_UPLOAD_BYTES = 10 * 1024 * 1024;

type ResumeFileValidation =
  | { valid: true; fileType: ResumeFileType }
  | {
      valid: false;
      code: "UNSUPPORTED_FILE_TYPE" | "FILE_TOO_LARGE" | "EMPTY_FILE";
      message: string;
    };

export function validateResumeFile(file: {
  name: string;
  type: string;
  size: number;
}): ResumeFileValidation {
  if (file.size === 0) {
    return {
      valid: false,
      code: "EMPTY_FILE",
      message: "This file is empty. Please choose another resume.",
    };
  }

  if (file.size > MAX_RESUME_UPLOAD_BYTES) {
    return {
      valid: false,
      code: "FILE_TOO_LARGE",
      message: "File size must be 10 MB or less.",
    };
  }

  const extension = file.name.toLowerCase().split(".").pop();
  const fileType: ResumeFileType | null =
    extension === "pdf" ? "pdf" : extension === "docx" ? "docx" : null;

  if (!fileType) {
    return {
      valid: false,
      code: "UNSUPPORTED_FILE_TYPE",
      message: "Please upload a PDF or DOCX resume.",
    };
  }

  const expectedMimeType =
    fileType === "pdf"
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const isGenericMimeType =
    file.type === "application/octet-stream" || file.type === "binary/octet-stream";

  if (file.type && file.type !== expectedMimeType && !isGenericMimeType) {
    return {
      valid: false,
      code: "UNSUPPORTED_FILE_TYPE",
      message: "Please upload a PDF or DOCX resume.",
    };
  }

  return { valid: true, fileType };
}