"use client";

import { useState } from "react";
import html2pdf from "html2pdf.js";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";
import { renderTemplateDocument } from "@/lib/templates/render";
import { createClient } from "@/lib/supabase/client";

export function useResumePdf() {
  const { resumeData, title, selectedTemplate, persistenceMode } = useResumeBuilder();
  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadPdf() {
    if (isDownloading || !selectedTemplate) return;
    setIsDownloading(true);
    try {
      const frame = document.createElement("iframe");
      frame.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0";
      frame.setAttribute("aria-hidden", "true");
      document.body.appendChild(frame);
      frame.srcdoc = renderTemplateDocument(selectedTemplate, resumeData);
      await new Promise<void>((resolve, reject) => {
        frame.onload = () => resolve();
        frame.onerror = () => reject(new Error("Could not prepare the resume."));
      });
      const body = frame.contentDocument?.body;
      if (!body) throw new Error("Could not prepare the resume.");
      const filename = `${(title || "my-resume").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-resume"}.pdf`;
      await html2pdf().set({ margin: 0, filename, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" }, jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" } }).from(body).save();
      if (persistenceMode === "authenticated") {
        void createClient().from("template_events").insert({ template_id: selectedTemplate.id, event_type: "downloaded" });
      }
    } catch (error) {
      console.error("PDF download failed:", error);
      window.dispatchEvent(new CustomEvent("resume-pdf-error"));
    } finally {
      document.querySelectorAll('iframe[aria-hidden="true"]').forEach((node) => node.remove());
      setIsDownloading(false);
    }
  }

  return { downloadPdf, isDownloading };
}

export default useResumePdf;

// html2pdf.js has no bundled declarations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _typecheck: any = html2pdf;
void _typecheck;

export {};

