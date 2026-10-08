"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Download, Loader2, X } from "lucide-react";
import Button, { buttonClassName } from "@/components/ui/button";
import { routes } from "@/lib/site";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";
import { useResumeDownload } from "@/components/resume/builder/use-resume-download";

export default function CompleteDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { saveStatus, saveError, persistenceMode, retrySave, completeness } = useResumeBuilder();
  const { download, preparing, error: downloadError, pdfReady } = useResumeDownload();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const isGuest = persistenceMode === "guest";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="complete-dialog-title"
      className="m-auto w-[calc(100%-2.5rem)] max-w-md rounded-lg border border-cream-dark bg-cream-light p-0 text-charcoal shadow-xl backdrop:bg-charcoal/40"
    >
      <div className="relative flex flex-col gap-5 p-6 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-md p-1 text-charcoal/50 hover:bg-cream-dark/60 hover:text-charcoal"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex flex-col gap-2">
          <SaveBadge status={saveStatus} guest={isGuest} />
          <h2 id="complete-dialog-title" className="font-serif text-2xl">
            Your resume is ready
          </h2>
          <p className="text-sm text-charcoal/65">
            {completeness < 100
              ? `It's ${completeness}% complete. You can keep editing any time.`
              : "Every section is filled in. Nice work."}
          </p>
        </div>

        {saveStatus === "error" && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              We couldn&apos;t save your latest changes.{saveError ? ` ${saveError}` : ""}{" "}
              <button type="button" onClick={retrySave} className="font-medium underline">
                Retry
              </button>
            </span>
          </div>
        )}

        {isGuest && (
          <p className="rounded-md bg-cream-dark/50 p-3 text-sm text-charcoal/70">
            You&apos;re building as a guest, so this resume lives on this device only.{" "}
            <Link href={routes.signIn} className="font-medium text-olive underline underline-offset-2">
              Sign in
            </Link>{" "}
            to keep it in your account.
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={download} disabled={preparing}>
            {preparing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {preparing ? "Preparing PDF…" : pdfReady ? "Save PDF As…" : "Download as PDF"}
          </Button>
          {pdfReady && (
            <p className="text-xs text-charcoal/60" role="status">
              Your PDF is ready. Choose where to save it.
            </p>
          )}
          {downloadError && (
            <p role="alert" className="text-sm text-destructive">
              {downloadError}
            </p>
          )}
          <Button variant="outline" onClick={onClose}>
            Keep editing
          </Button>
          {!isGuest && (
            <Link href="/dashboard" className={buttonClassName({ variant: "ghost" })}>
              Go to dashboard
            </Link>
          )}
        </div>
      </div>
    </dialog>
  );
}

function SaveBadge({ status, guest }: { status: string; guest: boolean }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-charcoal/60" role="status">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Saving…
      </span>
    );
  }
  if (status === "error") return null;
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-olive" role="status">
      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
      {guest ? "Saved on this device" : "Saved to your account"}
    </span>
  );
}
