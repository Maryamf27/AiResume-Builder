"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import TemplateGallery, { type GalleryTemplate } from "@/components/templates/template-gallery";
import { publishedTemplatesQueryOptions } from "@/lib/templates/client-cache";
import { renderTemplateDocument } from "@/lib/templates/render";
import { sampleResume } from "@/lib/templates/sample-data";

export default function TemplatesView() {
  const { data, isPending, isError } = useQuery(publishedTemplatesQueryOptions);

  // Render each template's sample preview once per data change, not on every visit.
  const items = useMemo<GalleryTemplate[]>(() => {
    const out: GalleryTemplate[] = [];
    for (const template of data ?? []) {
      try {
        out.push({
          id: template.id,
          slug: template.slug,
          name: template.name,
          category: template.category,
          description: template.description,
          srcDoc: renderTemplateDocument(template, sampleResume),
        });
      } catch (error) {
        // One broken template must not take the whole catalogue down.
        console.error(`Template "${template.slug}" failed to render:`, error);
      }
    }
    return out;
  }, [data]);

  return (
    <div className="w-full min-w-0">
      <Link
        href="/dashboard"
        className="-ml-2 mb-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-charcoal/65 transition-colors hover:bg-cream-dark/50 hover:text-charcoal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Dashboard
      </Link>

      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Templates</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-charcoal/60">
        Preview a design with sample content, then start a new resume with it. You can switch
        templates at any time in the builder without retyping.
      </p>

      <section className="mt-8 w-full min-w-0" aria-label="Available templates">
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-live="polite">
            <span className="sr-only">Loading templates…</span>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-lg border border-cream-dark bg-cream-light" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="w-full min-w-0 overflow-x-hidden">
            <TemplateGallery templates={items} compact startNew />
          </div>
        ) : (
          <div
            role={isError ? "alert" : undefined}
            className="rounded-lg border border-dashed border-cream-dark bg-cream-light px-6 py-12 text-center text-sm text-charcoal/65"
          >
            {isError
              ? "Templates could not be loaded. Please refresh in a moment."
              : "No templates are published right now. Check back soon."}
          </div>
        )}
      </section>
    </div>
  );
}
