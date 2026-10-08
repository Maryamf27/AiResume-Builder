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
  const { resumeData, title, selectedTemplate, userId } = useResumeBuilder();
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prepared, setPrepared] = useState<{ document: string; filename: string; pdf: Blob } | null>(null);
  const document = useMemo(
    () => buildResumeDocument(selectedTemplate, resumeData, resumePdfFilename(title)),
    [resumeData, selectedTemplate, title]
  );
  const filename = useMemo(() => resumePdfFilename(title), [title]);
  const pdfReady = Boolean(prepared && prepared.document === document);

  useEffect(() => {
    if (prepared && prepared.document !== document) setPrepared(null);
  }, [document, prepared]);

  async function download(): Promise<boolean> {
    if (preparing) return false;
    setPreparing(true);
    setError(null);
    try {
      if (prepared?.document === document) {
        await saveGeneratedResumePdf(prepared.pdf, prepared.filename, true);
        setPrepared(null);
      } else {
        const pdf = await generateResumePdf(document, filename);
        if (supportsSaveFilePicker()) {
          setPrepared({ document, filename, pdf });
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
