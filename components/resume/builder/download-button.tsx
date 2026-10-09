"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";
import { useResumeDownload } from "@/components/resume/builder/use-resume-download";

export default function DownloadButton() {
  const { persistenceMode } = useResumeBuilder();
  const { download, preparing, error, pdfReady } = useResumeDownload();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  async function handleDownload() {
    setDownloadStarted(false);
    const downloaded = await download();
    if (downloaded && persistenceMode === "guest") {
      setShowGuestPrompt(true);
    }
    if (downloaded) setDownloadStarted(true);
  }

  return (
    <span className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline-olive"
        size="sm"
        onClick={() => void handleDownload()}
        disabled={preparing}
        title={pdfReady ? "Your PDF is ready. Choose where to save it." : "Download your resume as a PDF"}
      >
        {preparing ? (
          <>
            <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />
            Preparing PDF…
          </>
        ) : (
          <>
            {pdfReady ? (
              <CheckCircle2 data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Download data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
            )}
            {pdfReady ? "Save As" : "Download"}
          </>
        )}
      </Button>
      {error && (
        <span className="max-w-40 text-right text-xs text-destructive sm:max-w-56" role="alert">
          {error}
        </span>
      )}
      {pdfReady && !preparing && (
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-olive/10 px-2 py-1 text-[11px] font-medium text-olive-dark" role="status">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          PDF ready
        </span>
      )}
      {downloadStarted && !pdfReady && !error && (
        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-olive/10 px-2 py-1 text-[11px] font-medium text-olive-dark" role="status">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Download started
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
