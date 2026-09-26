import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import PageIntro from "@/components/public/page-intro";
import ButtonLink from "@/components/ui/button-link";
import { pageMetadata } from "@/lib/seo";
import { containerClass, routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Resume & Career Insights",
  description:
    "A future home for writing about resumes and applications. No articles have been published yet.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <main id="main-content">
      <PageIntro
        eyebrow="Blog"
        title="Notes on resumes, written carefully."
        description="This space is reserved for future essays — structure, tone, and how a page is read. There is no CMS behind it yet, and we are not inventing authors or dates."
      />

      <section className="border-t border-cream-dark/60 bg-cream-light/40">
        <div className={`${containerClass} py-14 sm:py-20`}>
          <div className="mx-auto flex max-w-xl flex-col items-center rounded-xl border border-dashed border-olive/30 bg-cream px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-olive/10 text-olive">
              <BookOpen className="h-6 w-6" strokeWidth={2} aria-hidden />
            </span>
            <h2 className="mt-6 font-serif text-2xl tracking-tight text-charcoal sm:text-3xl">
              Coming soon
            </h2>
            <p className="mt-4 text-sm leading-6 text-charcoal/70 sm:text-base">
              Insights for better resumes and career applications are coming
              soon.
            </p>
            <div className="mt-8">
              <ButtonLink href={routes.createResume} variant="primary" size="lg">
                Create Resume
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
