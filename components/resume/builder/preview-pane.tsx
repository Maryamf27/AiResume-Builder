"use client";

import { useDeferredValue, useMemo } from "react";
import TemplateFrame from "@/components/templates/template-frame";
import ResumePreview from "@/components/resume/preview/resume-preview";
import TemplatePicker from "@/components/resume/builder/template-picker";
import { renderTemplateDocument } from "@/lib/templates/render";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function PreviewPane() {
  const { resumeData, selectedTemplate } = useResumeBuilder();

  // Keep typing snappy: the preview follows a beat behind the form.
  const deferredData = useDeferredValue(resumeData);

  const doc = useMemo(() => {
    if (!selectedTemplate) return null;
    try {
      return renderTemplateDocument(selectedTemplate, deferredData);
    } catch (err) {
      console.error("Template failed to render:", err);
      return null;
    }
  }, [selectedTemplate, deferredData]);

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <TemplatePicker />
      {/* If no template is published (or one fails to render), fall back to the built-in layout. */}
      {doc ? <TemplateFrame srcDoc={doc} title="Resume preview" className="w-full max-w-full" /> : <ResumePreview />}
    </div>
  );
}
