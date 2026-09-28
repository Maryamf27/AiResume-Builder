"use client";

import { Info } from "lucide-react";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function GuestNotice() {
  const { persistenceMode } = useResumeBuilder();

  if (persistenceMode === "authenticated") {
    return (
      <p className="flex items-start gap-2 text-xs leading-5 text-charcoal/55">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Signed in. Your resume is saved to your account.
      </p>
    );
  }

  return (
    <p className="flex items-start gap-2 text-xs leading-5 text-charcoal/55">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Building as a guest. Your resume is saved on this device.
    </p>
  );
}
