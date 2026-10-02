"use client";

import { useState } from "react";
import { buildResumeDocument, downloadResumePdf, resumePdfFilename } from "@/lib/resume/pdf";
import { recordTemplateEvent } from "@/lib/resume/resumes";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export function useResumeDownload() {
  const { resumeData, title, selectedTemplate, userId } = useResumeBuilder();
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download(): Promise<boolean> {
    if (preparing) return false;
    setPreparing(true);
    setError(null);
    try {
      const filename = resumePdfFilename(title);
      const doc = buildResumeDocument(selectedTemplate, resumeData, filename);
      await downloadResumePdf(doc, filename, true);
      if (selectedTemplate) {
        recordTemplateEvent(selectedTemplate.id, userId, "downloaded");
      }
      return true;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return false;
      setError(
        err instanceof Error ? err.message : "Couldn't prepare the PDF. Please try again."
      );
      return false;
    } finally {
      setPreparing(false);
    }
  }

  return { download, preparing, error };
}
