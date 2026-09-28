"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import { routes, SITE_NAME } from "@/lib/site";
import { useResumeBuilder, type PersistenceMode, type SaveStatus } from "@/components/resume/builder/resume-builder-context";

export default function BuilderHeader() {
  const { saveStatus, saveError, persistenceMode, retrySave, loadFailed, retryLoad } =
    useResumeBuilder();

  return (
    <header className="border-b border-cream-dark/60 bg-cream-light">
      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
        <Link href={routes.home} className="flex items-baseline gap-2">
          <span className="font-serif text-lg text-charcoal">{SITE_NAME}</span>
          <span className="hidden text-sm text-charcoal/50 sm:inline">Resume Builder</span>
        </Link>

        <div className="flex items-center gap-4">
          {loadFailed ? (
            <span className="flex items-center gap-2 text-xs text-destructive" role="alert">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Couldn&apos;t load your saved resume. Changes won&apos;t be saved yet.</span>
              <button
                type="button"
                onClick={retryLoad}
                className="font-medium underline decoration-destructive/40 underline-offset-2 hover:decoration-destructive"
              >
                Retry
              </button>
            </span>
          ) : (
            <SaveIndicator
              status={saveStatus}
              mode={persistenceMode}
              error={saveError}
              onRetry={retrySave}
            />
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Download will be available once templates ship"
          >
            <Download data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
            Download
          </Button>
        </div>
      </div>
    </header>
  );
}

function SaveIndicator({
  status,
  mode,
  error,
  onRetry,
}: {
  status: SaveStatus;
  mode: PersistenceMode;
  error: string | null;
  onRetry: () => void;
}) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-charcoal/55" role="status">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Saving…
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-charcoal/55" role="status">
        <CheckCircle2 className="h-3.5 w-3.5 text-olive" aria-hidden="true" />
        {mode === "authenticated" ? "Saved just now" : "Saved on this device"}
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-2 text-xs text-destructive" role="alert">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Unable to save.
          {error && <span className="hidden sm:inline"> Your edits are still here.</span>}
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="font-medium underline decoration-destructive/40 underline-offset-2 hover:decoration-destructive"
        >
          Retry
        </button>
      </span>
    );
  }

  return null;
}
