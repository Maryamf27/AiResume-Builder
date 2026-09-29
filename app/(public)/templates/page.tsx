import type { Metadata } from "next";
import FinalCta from "@/components/public/final-cta";
import PageIntro from "@/components/public/page-intro";
import TemplateGallery from "@/components/templates/template-gallery";
import ButtonLink from "@/components/ui/button-link";
import { pageMetadata } from "@/lib/seo";
import { containerClass, routes } from "@/lib/site";
import { loadPublishedTemplates } from "@/lib/templates/load-gallery";

export const metadata: Metadata = pageMetadata({
  title: "Resume Templates",
  description:
    "Ten professional resume templates for Resonance, from a traditional classic to a plain ATS-friendly layout. Preview each one and switch any time without retyping.",
  path: "/templates",
});

export default async function TemplatesPage() {
  const { items, failed } = await loadPublishedTemplates();

  return (
    <main id="main-content">
      <PageIntro
        eyebrow="Templates"
        title="Choose a professional resume design."
        description="Every template is ready to fill in. Preview it with sample content, start from the one you like, and switch to another at any time without retyping a word."
      />

      <section
        className="border-t border-cream-dark/60 bg-cream-light/40"
        aria-labelledby="catalogue-heading"
      >
        <div className={`${containerClass} py-12 sm:py-16`}>
          <h2 id="catalogue-heading" className="sr-only">
            Available templates
          </h2>

          {items.length > 0 ? (
            <TemplateGallery templates={items} />
          ) : (
            <div
              role={failed ? "alert" : undefined}
              className="rounded-xl border border-dashed border-olive/30 bg-cream px-6 py-10 text-center sm:px-10"
            >
              <p className="font-serif text-2xl tracking-tight text-charcoal">
                {failed ? "Templates could not be loaded." : "No templates are published right now."}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-charcoal/70">
                {failed
                  ? "Please refresh the page in a moment. You can still start a resume and choose a template in the builder."
                  : "Check back soon. You can start your resume now and choose a layout later."}
              </p>
              <div className="mt-6 flex justify-center">
                <ButtonLink href={routes.createResume} size="lg">
                  Create Resume
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </section>

      <FinalCta
        title="Start with the layout you like."
        description="Create Resume opens the builder with no account needed. Your content stays put when you try a different template."
      />
    </main>
  );
}
