"use client";

import { useMemo } from "react";
import TemplateFrame from "@/components/templates/template-frame";
import { renderTemplateDocument } from "@/lib/templates/render";
import { sampleResume } from "@/lib/templates/sample-data";
import type { PublishedTemplate } from "@/lib/templates/types";
import { cn } from "@/lib/utils";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

function Thumbnail({ template }: { template: PublishedTemplate }) {
  // Thumbnails use the sample resume, so they render once and stay cheap
  // while the user types.
  const doc = useMemo(() => {
    try {
      return renderTemplateDocument(template, sampleResume);
    } catch {
      return null;
    }
  }, [template]);

  if (!doc) return <div className="flex h-full items-center justify-center text-xs text-charcoal/40">Unavailable</div>;
  return (
    // The iframe would swallow clicks; the button around it must receive them.
    <div className="pointer-events-none">
      <TemplateFrame srcDoc={doc} title={`${template.name} thumbnail`} className="border-0 shadow-none" lazy />
    </div>
  );
}

export default function TemplatePicker() {
  const { templates, templatesStatus, selectedTemplate, selectTemplate } = useResumeBuilder();

  if (templatesStatus === "loading") {
    return (
      <div className="mb-4 flex gap-3" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 w-28 shrink-0 animate-pulse rounded-md bg-cream-dark/60" />
        ))}
      </div>
    );
  }

  // Nothing published (or the fetch failed): the built-in preview is shown instead.
  if (templates.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium text-charcoal">Template</p>
      <div className="flex gap-3 overflow-x-auto pb-2" role="group" aria-label="Choose a template">
        {templates.map((t) => {
          const selected = t.id === selectedTemplate?.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTemplate(t.id)}
              aria-pressed={selected}
              className={cn(
                "w-28 shrink-0 rounded-md border bg-cream-light p-1.5 text-left transition-colors",
                selected ? "border-olive ring-2 ring-olive/40" : "border-cream-dark hover:border-charcoal/30"
              )}
            >
              <div className="overflow-hidden rounded-sm border border-cream-dark/70 bg-white">
                <Thumbnail template={t} />
              </div>
              <span className="mt-1.5 block truncate text-xs font-medium text-charcoal">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
