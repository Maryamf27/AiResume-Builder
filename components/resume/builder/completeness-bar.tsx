"use client";

import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function CompletenessBar() {
  const { completeness } = useResumeBuilder();

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-charcoal/60">
        <span>Resume completeness</span>
        <span className="tabular-nums">{completeness}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={completeness}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Resume completeness"
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cream-dark"
      >
        <div
          className="h-full rounded-full bg-olive transition-[width] duration-300"
          style={{ width: `${completeness}%` }}
        />
      </div>
    </div>
  );
}
