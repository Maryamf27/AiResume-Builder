"use client";

import { useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResumeBuilderProvider } from "@/components/resume/builder/resume-builder-context";
import BuilderHeader from "@/components/resume/builder/builder-header";
import SectionNav from "@/components/resume/builder/section-nav";
import CompletenessBar from "@/components/resume/builder/completeness-bar";
import GuestImportBanner from "@/components/resume/builder/guest-import-banner";
import GuestNotice from "@/components/resume/builder/guest-notice";
import ActiveSectionForm from "@/components/resume/builder/active-section-form";
import PreviewPane from "@/components/resume/builder/preview-pane";

export default function ResumeBuilder({
  resumeId,
  initialTemplateSlug,
  startNew,
}: {
  resumeId?: string;
  initialTemplateSlug?: string;
  startNew?: boolean;
}) {
  return (
    <ResumeBuilderProvider
      resumeId={resumeId}
      initialTemplateSlug={initialTemplateSlug}
      startNew={startNew}
    >
      <ResumeBuilderShell />
    </ResumeBuilderProvider>
  );
}

function ResumeBuilderShell() {
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");

  return (
    <div className="flex min-h-[100svh] flex-col overflow-x-hidden bg-cream">
      <BuilderHeader />

      <div className="mx-auto w-full max-w-7xl flex-1 overflow-x-hidden px-5 py-6 sm:px-8 sm:py-8">
        <button
          type="button"
          onClick={() => setMobileView((v) => (v === "edit" ? "preview" : "edit"))}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-md border border-cream-dark bg-cream-light px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-cream-dark/60 lg:hidden"
        >
          {mobileView === "edit" ? (
            <>
              <Eye className="h-4 w-4" aria-hidden="true" />
              Preview resume
            </>
          ) : (
            <>
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Back to editor
            </>
          )}
        </button>

        <GuestImportBanner />

        <div className="grid min-w-0 gap-8 lg:grid-cols-[460px_minmax(0,1fr)] xl:grid-cols-[520px_minmax(0,1fr)]">
          <div
            className={cn(
              "flex min-w-0 flex-col gap-6 overflow-x-hidden",
              mobileView === "preview" ? "hidden lg:flex" : "flex"
            )}
          >
            <div className="flex flex-col gap-3">
              <CompletenessBar />
              <GuestNotice />
            </div>
            <SectionNav />
            <div className="rounded-lg border border-cream-dark bg-cream-light p-5 sm:p-6">
              <ActiveSectionForm />
            </div>
          </div>

          <div className={cn("min-w-0 overflow-x-hidden", mobileView === "edit" ? "hidden lg:block" : "block")}>
            <PreviewPane />
          </div>
        </div>
      </div>
    </div>
  );
}
