"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, BriefcaseBusiness, CheckCircle2, LayoutTemplate, Loader2, Pencil, Sparkles } from "lucide-react";
import DownloadButton from "@/components/resume/builder/download-button";
import { useResumeBuilder, type PersistenceMode, type SaveStatus } from "@/components/resume/builder/resume-builder-context";
import Button from "@/components/ui/button";

export default function BuilderHeader({
  onOpenAtsAnalysis,
  onOpenJobAnalysis,
}: {
  onOpenAtsAnalysis: () => void;
  onOpenJobAnalysis: () => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const {
    title,
    updateTitle,
    saveStatus,
    saveError,
    persistenceMode,
    retrySave,
    loadFailed,
    retryLoad,
    templatesStatus,
    openTemplatesDialog,
  } = useResumeBuilder();

  const backHref = persistenceMode === "authenticated" ? "/dashboard" : "/templates";
  const backLabel = persistenceMode === "authenticated" ? "Dashboard" : "Templates";

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  return (
    <header className="w-full border-b border-cream-dark/60 bg-cream-light">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link
            href={backHref}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-charcoal/65 transition-colors hover:bg-cream-dark/50 hover:text-charcoal"
            title={backLabel}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">{backLabel}</span>
          </Link>
          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                value={title}
                onChange={(e) => updateTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }}
                placeholder="My Resume"
                maxLength={120}
                aria-label="Resume title"
                className="min-w-0 w-full rounded-md border border-olive bg-cream px-2 py-1.5 text-sm font-semibold text-charcoal outline-none focus-visible:ring-2 focus-visible:ring-olive-light sm:max-w-xs"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                aria-label="Rename resume title"
                title="Rename resume title"
                className="group inline-flex max-w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-semibold text-charcoal transition-colors hover:bg-cream-dark/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
              >
                <span className="truncate">{title || "My Resume"}</span>
                <Pencil
                  className="h-4 w-4 shrink-0 text-olive transition-colors group-hover:text-olive-dark"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {loadFailed ? (
            <span className="flex max-w-[60vw] items-center gap-2 text-[11px] text-destructive sm:text-xs" role="alert">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAtsAnalysis}
            title="Analyze ATS compatibility"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">ATS Analysis</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenJobAnalysis}
            title="Analyze job description"
          >
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">Job Analysis</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openTemplatesDialog}
            disabled={templatesStatus !== "ready"}
            title="Browse and switch templates"
          >
            <LayoutTemplate className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">Templates</span>
          </Button>
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
      <span className="flex items-center gap-1.5 text-[11px] text-charcoal/55 sm:text-xs" role="status">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        <span className="truncate">Saving…</span>
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-[11px] text-charcoal/55 sm:text-xs" role="status">
        <CheckCircle2 className="h-3.5 w-3.5 text-olive" aria-hidden="true" />
        <span className="hidden sm:inline">
          {mode === "authenticated" ? "Saved just now" : "Saved on this device"}
        </span>
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="flex items-center gap-2 text-[11px] text-destructive sm:text-xs" role="alert">
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
