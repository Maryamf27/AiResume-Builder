"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildResumeDocument,
  generateResumePdf,
  resumePdfFilename,
  saveGeneratedResumePdf,
  supportsSaveFilePicker,
} from "@/lib/resume/pdf";
import { recordTemplateEvent } from "@/lib/resume/resumes";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export function useResumeDownload() {
  const { resumeData, title, selectedTemplate, userId, preparedResumePdf, setPreparedResumePdf } = useResumeBuilder();
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const document = useMemo(
    () => buildResumeDocument(selectedTemplate, resumeData, resumePdfFilename(title)),
    [resumeData, selectedTemplate, title]
  );
  const filename = useMemo(() => resumePdfFilename(title), [title]);
  const pdfReady = Boolean(preparedResumePdf && preparedResumePdf.document === document);

  useEffect(() => {
    if (preparedResumePdf && preparedResumePdf.document !== document) setPreparedResumePdf(null);
  }, [document, preparedResumePdf, setPreparedResumePdf]);

  async function download(): Promise<boolean> {
    if (preparing) return false;
    setPreparing(true);
    setError(null);
    try {
      if (preparedResumePdf?.document === document) {
        await saveGeneratedResumePdf(preparedResumePdf.pdf, preparedResumePdf.filename, true);
        setPreparedResumePdf(null);
      } else {
        const pdf = await generateResumePdf(document, filename);
        if (supportsSaveFilePicker()) {
          setPreparedResumePdf({ document, filename, pdf });
          return false;
        }
        await saveGeneratedResumePdf(pdf, filename);
      }
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

  return { download, preparing, error, pdfReady };
}
