export type ResumeFileType = "pdf" | "docx";

export type ResumeExtractionErrorCode =
  | "INVALID_REQUEST"
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "INVALID_FILE"
  | "NO_EXTRACTABLE_TEXT"
  | "TEXT_TOO_LARGE"
  | "EXTRACTION_FAILED";

export type ResumeExtractionResult =
  | {
      success: true;
      fileName: string;
      fileType: ResumeFileType;
      text: string;
    }
  | {
      success: false;
      code: ResumeExtractionErrorCode;
      message: string;
    };