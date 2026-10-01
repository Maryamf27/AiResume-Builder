"use client";

import { useMemo, useState } from "react";
import { Check, Eye, Loader2 } from "lucide-react";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import TemplateFrame from "@/components/templates/template-frame";
import { sampleResume } from "@/lib/templates/sample-data";
import { renderTemplateDocument } from "@/lib/templates/render";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";
import type { PublishedTemplate } from "@/lib/templates/types";
import { cn } from "@/lib/utils";

function SampleThumbnail({ template }: { template: PublishedTemplate }) {
  const doc = useMemo(() => {
    try {
      return renderTemplateDocument(template, sampleResume);
    } catch {
      return null;
    }
  }, [template]);

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-charcoal/40">
        Unavailable
      </div>
    );
  }

  return (
    <div className="pointer-events-none">
      <TemplateFrame
        srcDoc={doc}
        title={`${template.name} thumbnail`}
        className="rounded-none border-0 shadow-none"
        lazy
      />
    </div>
  );
}

function SamplePreviewDoc({ template }: { template: PublishedTemplate }) {
  const doc = useMemo(() => {
    try {
      return renderTemplateDocument(template, sampleResume);
    } catch {
      return null;
    }
  }, [template]);

  if (!doc) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-charcoal/40">
        Template preview unavailable.
      </div>
    );
  }

  return <TemplateFrame srcDoc={doc} title={`${template.name} full preview`} />;
}

export default function TemplatesDialog() {
  const {
    templates,
    templatesStatus,
    selectedTemplate,
    selectTemplate,
    templatesDialogOpen,
    closeTemplatesDialog,
  } = useResumeBuilder();

  const [previewing, setPreviewing] = useState<PublishedTemplate | null>(null);

  return (
    <>
      <Dialog
        open={templatesDialogOpen}
        onClose={closeTemplatesDialog}
        title="Resume templates"
        description="Switch to any design at any time. Your content moves with you — nothing is retyped."
        className="max-w-5xl"
      >
        {templatesStatus === "loading" ? (
          <div
            className="flex items-center gap-2 py-10 text-center text-sm text-charcoal/60"
            role="status"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading templates…
          </div>
        ) : templatesStatus === "error" ? (
          <p className="py-10 text-center text-sm text-destructive">
            Couldn&apos;t load templates. Close this dialog and try again.
          </p>
        ) : templates.length === 0 ? (
          <p className="py-10 text-center text-sm text-charcoal/60">
            No templates are published yet.
          </p>
        ) : (
          <>
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => {
                const isCurrent = t.id === selectedTemplate?.id;
                return (
                  <li
                    key={t.id}
                    className="flex flex-col overflow-hidden rounded-lg border border-cream-dark/60 bg-cream"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewing(t)}
                      aria-label={`Preview the ${t.name} template`}
                      className="block w-full bg-cream-light p-3 text-left transition-colors hover:bg-cream-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
                    >
                      <div className="pointer-events-none aspect-794/1123 overflow-hidden rounded-sm border border-cream-dark bg-white">
                        <SampleThumbnail template={t} />
                      </div>
                    </button>
                    <div className="flex flex-1 flex-col border-t border-cream-dark/60 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-serif text-lg text-charcoal">{t.name}</h3>
                        {t.category && (
                          <Badge className="shrink-0">{t.category}</Badge>
                        )}
                      </div>
                      {t.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-charcoal/65">
                          {t.description}
                        </p>
                      )}
                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewing(t)}
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                          Preview
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => selectTemplate(t.id)}
                          className={cn(
                            isCurrent &&
                              "cursor-default border border-olive/40 bg-olive/10 text-olive hover:bg-olive/15"
                          )}
                          disabled={isCurrent}
                        >
                          {isCurrent ? (
                            <>
                              <Check className="h-4 w-4" aria-hidden="true" />
                              In use
                            </>
                          ) : (
                            "Use Template"
                          )}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex justify-end">
              <Button variant="ghost" onClick={closeTemplatesDialog}>
                Close
              </Button>
            </div>
          </>
        )}
      </Dialog>

      <Dialog
        open={previewing !== null}
        onClose={() => setPreviewing(null)}
        title={previewing?.name ?? "Template preview"}
        description={previewing?.description ?? undefined}
        className="max-w-3xl"
      >
        {previewing && (
          <>
            <p className="mt-3 text-xs text-charcoal/55">
              Shown with sample content. Your own details replace it in the builder.
            </p>
            <div className="mt-4 max-h-[65vh] overflow-y-auto rounded-sm border border-cream-dark bg-cream-dark/30 p-2 sm:p-4">
              <SamplePreviewDoc template={previewing} />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPreviewing(null)}
                className="text-xs text-charcoal/55 underline underline-offset-2 hover:text-charcoal"
              >
                ← Back to all templates
              </button>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="ghost" onClick={() => setPreviewing(null)}>
                  Close
                </Button>
                {(() => {
                  const isCurrent = previewing.id === selectedTemplate?.id;
                  return (
                    <Button
                      size="sm"
                      disabled={isCurrent}
                      onClick={() => {
                        selectTemplate(previewing.id);
                        setPreviewing(null);
                      }}
                      className={cn(
                        isCurrent &&
                          "cursor-default border border-olive/40 bg-olive/10 text-olive hover:bg-olive/15"
                      )}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="h-4 w-4" aria-hidden="true" />
                          In use
                        </>
                      ) : (
                        "Use Template"
                      )}
                    </Button>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
