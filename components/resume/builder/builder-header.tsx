"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import DownloadButton from "@/components/resume/builder/download-button";
import { useResumeBuilder, type PersistenceMode, type SaveStatus } from "@/components/resume/builder/resume-builder-context";

export default function BuilderHeader() {
  const {
    title,
    updateTitle,
    saveStatus,
    saveError,
    persistenceMode,
    retrySave,
    loadFailed,
    retryLoad,
  } = useResumeBuilder();

  const backHref = persistenceMode === "authenticated" ? "/dashboard" : "/";
  const backLabel = persistenceMode === "authenticated" ? "Dashboard" : "Home";

  return (
    <header className="border-b border-cream-dark/60 bg-cream-light">
      <div className="flex h-16 items-center justify-between gap-3 px-5 sm:gap-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={backHref}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-charcoal/65 transition-colors hover:bg-cream-dark/50 hover:text-charcoal"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>
          <input
            value={title}
            onChange={(e) => updateTitle(e.target.value)}
            placeholder="My Resume"
            maxLength={120}
            aria-label="Resume title"
            className="w-36 min-w-0 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-sm font-semibold text-charcoal outline-none transition-colors placeholder:text-charcoal/40 hover:border-cream-dark focus:border-olive focus:bg-cream sm:w-56"
          />
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {loadFailed ? (
            <span className="flex items-center gap-2 text-xs text-destructive" role="alert">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">
                Couldn&apos;t load this resume. Changes won&apos;t be saved yet.
              </span>
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
          <DownloadButton />
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
        <span className="hidden sm:inline">
          {mode === "authenticated" ? "Saved just now" : "Saved on this device"}
        </span>
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
