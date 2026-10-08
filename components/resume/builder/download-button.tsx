"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";
import { useResumeDownload } from "@/components/resume/builder/use-resume-download";

export default function DownloadButton() {
  const { persistenceMode } = useResumeBuilder();
  const { download, preparing, error, pdfReady } = useResumeDownload();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  async function handleDownload() {
    const downloaded = await download();
    if (downloaded && persistenceMode === "guest") {
      setShowGuestPrompt(true);
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
            {pdfReady ? "Save As" : "Download"}
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
