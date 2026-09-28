"use client";

import { CheckCircle2, Info, X } from "lucide-react";
import Button from "@/components/ui/button";
import { hasResumeContent } from "@/lib/resume/guest-import";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function GuestImportBanner() {
  const {
    resumeData,
    hasPendingGuestResume,
    guestImportNotice,
    guestImportError,
    importGuestResume,
    discardGuestResume,
    dismissGuestImportNotice,
  } = useResumeBuilder();

  if (hasPendingGuestResume) {
    const willReplace = hasResumeContent(resumeData);
    return (
      <div role="alert" className="mb-6 rounded-lg border border-olive/30 bg-olive/5 p-4">
        <p className="flex items-start gap-2 text-sm text-charcoal">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-olive" aria-hidden="true" />
          <span>
            We found a resume you started as a guest on this device.
            {willReplace
              ? " Importing it will replace the resume saved in your account."
              : " Add it to your account?"}
          </span>
        </p>
        {guestImportError && (
          <p className="mt-2 pl-6 text-sm text-destructive">
            Couldn&apos;t import it: {guestImportError}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 pl-6">
          <Button size="sm" onClick={() => void importGuestResume()}>
            {guestImportError ? "Try again" : "Import guest resume"}
          </Button>
          <Button size="sm" variant="outline" onClick={discardGuestResume}>
            {willReplace ? "Keep my saved resume" : "Discard it"}
          </Button>
        </div>
      </div>
    );
  }

  if (guestImportNotice) {
    return (
      <div
        role="status"
        className="mb-6 flex items-start gap-2 rounded-lg border border-olive/30 bg-olive/5 p-4 text-sm text-charcoal"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-olive" aria-hidden="true" />
        <span className="flex-1">Your guest resume has been added to your account.</span>
        <button
          type="button"
          onClick={dismissGuestImportNotice}
          aria-label="Dismiss"
          className="rounded p-0.5 text-charcoal/50 hover:text-charcoal"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return null;
}