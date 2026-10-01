"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import Dialog from "@/components/ui/dialog";
import TemplateFrame from "@/components/templates/template-frame";
import { routes } from "@/lib/site";

export interface GalleryTemplate {
  id: string;
  slug: string;
  name: string;
  category: string | null;
  description: string | null;
  /** Full rendered document (sample resume), produced on the server. */
  srcDoc: string;
}

function builderHref(slug: string, startNew: boolean) {
  const params = new URLSearchParams();
  // Signed-in users start a fresh draft instead of reopening their latest resume.
  if (startNew) params.set("new", "1");
  params.set("template", slug);
  return `${routes.createResume}?${params.toString()}`;
}

function UseTemplateLink({
  slug,
  name,
  size,
  startNew,
}: {
  slug: string;
  name: string;
  size?: "sm" | "md";
  startNew: boolean;
}) {
  return (
    <ButtonLink href={builderHref(slug, startNew)} size={size} aria-label={`Use the ${name} template`}>
      Use Template
    </ButtonLink>
  );
}

export default function TemplateGallery({
  templates,
  compact = false,
  startNew = false,
}: {
  templates: GalleryTemplate[];
  /** Open the builder with a new draft (signed-in dashboard) rather than the latest resume. */
  startNew?: boolean;
  /** Fewer columns, for use beside a sidebar where the content area is narrower. */
  compact?: boolean;
}) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewing = templates.find((t) => t.id === previewId) ?? null;

  return (
    <>
      <ul
        className={
          compact
            ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {templates.map((t) => (
          <li
            key={t.id}
            className="flex flex-col overflow-hidden rounded-lg border border-cream-dark/60 bg-cream"
          >
            <button
              type="button"
              onClick={() => setPreviewId(t.id)}
              aria-label={`Preview the ${t.name} template`}
              className="block w-full bg-cream-light p-4 text-left transition-colors hover:bg-cream-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
            >
              {/* First page only; the frame itself is inert so the button gets the click. */}
              <div className="pointer-events-none aspect-794/1123 overflow-hidden rounded-sm border border-cream-dark bg-white">
                <TemplateFrame
                  srcDoc={t.srcDoc}
                  title={`${t.name} template preview`}
                  className="rounded-none border-0 shadow-none"
                  lazy
                />
              </div>
            </button>

            <div className="flex flex-1 flex-col border-t border-cream-dark/60 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-serif text-lg text-charcoal">{t.name}</h3>
                {t.category && <Badge className="shrink-0">{t.category}</Badge>}
              </div>
              {t.description && (
                <p className="mt-1.5 text-sm leading-6 text-charcoal/65">{t.description}</p>
              )}
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <Button variant="outline" size="sm" onClick={() => setPreviewId(t.id)}>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Preview
                </Button>
                <UseTemplateLink slug={t.slug} name={t.name} size="sm" startNew={startNew} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Dialog
        open={previewing !== null}
        onClose={() => setPreviewId(null)}
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
              <TemplateFrame srcDoc={previewing.srcDoc} title={`${previewing.name} template preview`} />
            </div>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setPreviewId(null)}>
                Close
              </Button>
              <UseTemplateLink slug={previewing.slug} name={previewing.name} startNew={startNew} />
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
