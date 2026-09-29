"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { buildResumeDocument, printResumeDocument, resumePdfFilename } from "@/lib/resume/pdf";
import { recordTemplateEvent } from "@/lib/resume/resumes";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function DownloadButton() {
  const { resumeData, title, selectedTemplate, persistenceMode, userId } =
    useResumeBuilder();
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  async function handleDownload() {
    // Never allow two PDF generations at once.
    if (preparing) return;
    setPreparing(true);
    setError(null);
    try {
      const filename = resumePdfFilename(title, resumeData);
      const doc = buildResumeDocument(selectedTemplate, resumeData, filename);
      printResumeDocument(doc);
      // Count the download only after the print window actually opened.
      if (selectedTemplate) {
        recordTemplateEvent(selectedTemplate.id, userId, "downloaded");
      }
      if (persistenceMode === "guest") {
        setShowGuestPrompt(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't prepare the PDF. Please try again."
      );
    } finally {
      setPreparing(false);
    }
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline-olive"
        size="sm"
        onClick={() => void handleDownload()}
        disabled={preparing}
      >
        {preparing ? (
          <>
            <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />
            Preparing PDF…
          </>
        ) : (
          <>
            <Download data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
            Download
          </>
        )}
      </Button>
      {error && (
        <span className="max-w-56 text-right text-xs text-destructive" role="alert">
          {error}
        </span>
      )}

      <Dialog
        open={showGuestPrompt}
        onClose={() => setShowGuestPrompt(false)}
        title="Want to save this resume and edit it later?"
        description="Create a free account and the resume you just built will be moved into it automatically — no need to re-enter anything."
      >
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link
            href="/auth/login"
            className="inline-flex h-10 items-center justify-center rounded-md border border-charcoal/15 px-5 text-sm font-medium text-charcoal transition-colors hover:bg-cream-light"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex h-10 items-center justify-center rounded-md bg-olive px-5 text-sm font-medium text-cream transition-colors hover:bg-olive-dark"
          >
            Create Account
          </Link>
        </div>
      </Dialog>
    </span>
  );
}
