import type { Metadata } from "next";
import FinalCta from "@/components/public/final-cta";
import PageIntro from "@/components/public/page-intro";
import ButtonLink from "@/components/ui/button-link";
import { pageMetadata } from "@/lib/seo";
import { containerClass, routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Resume Templates",
  description:
    "Professional resume designs for Resonance. The library is being prepared and will be managed in the product rather than hardcoded.",
  path: "/templates",
});

const directions = [
  {
    name: "Editorial",
    note: "Serif headings, generous margins, a page that reads like a journal.",
  },
  {
    name: "Structured",
    note: "Clear section rules for dense experience without visual noise.",
  },
  {
    name: "Quiet",
    note: "Minimal rules and type — useful when the writing should carry the page.",
  },
];

export default function TemplatesPage() {
  return (
    <main id="main-content">
      <PageIntro
        eyebrow="Templates"
        title="Choose a professional resume design."
        description="When the editor opens, you will pick from a managed library of layouts and switch later without rewriting. The catalogue is still being prepared — these frames show direction, not live files you can download today."
      />

      <section
        className="border-t border-cream-dark/60 bg-cream-light/40"
        aria-labelledby="prepared-heading"
      >
        <div className={`${containerClass} py-14 sm:py-20`}>
          <div className="rounded-xl border border-dashed border-olive/30 bg-cream px-6 py-10 text-center sm:px-10">
            <h2
              id="prepared-heading"
              className="font-serif text-2xl tracking-tight text-charcoal sm:text-3xl"
            >
              Templates are being prepared
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-charcoal/70 sm:text-base">
              A minimum set of professional designs will live in the product and
              be maintained there. We are not shipping placeholder templates
              that pretend to be finished.
            </p>
            <div className="mt-8 flex justify-center">
              <ButtonLink href={routes.createResume} variant="primary" size="lg">
                Create Resume
              </ButtonLink>
            </div>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {directions.map((item) => (
              <li
                key={item.name}
                className="overflow-hidden rounded-lg border border-cream-dark/60 bg-cream"
              >
                <div className="aspect-[3/4] bg-cream-light p-5">
                  <div className="h-full rounded-md border border-cream-dark/80 bg-cream p-4">
                    <div className="h-3 w-1/2 rounded-sm bg-olive/25" />
                    <div className="mt-6 space-y-2">
                      <div className="h-1.5 w-full rounded-sm bg-charcoal/10" />
                      <div className="h-1.5 w-4/5 rounded-sm bg-charcoal/10" />
                      <div className="h-1.5 w-3/5 rounded-sm bg-charcoal/10" />
                    </div>
                    <div className="mt-8 space-y-2">
                      <div className="h-1.5 w-full rounded-sm bg-charcoal/10" />
                      <div className="h-1.5 w-full rounded-sm bg-charcoal/10" />
                      <div className="h-1.5 w-2/3 rounded-sm bg-charcoal/10" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-cream-dark/60 px-5 py-4">
                  <h3 className="font-serif text-lg text-charcoal">{item.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-charcoal/65">{item.note}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-olive">
                    Preview only
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCta
        title="The editor will use these layouts."
        description="Create Resume opens the guest builder now — these ten layouts are what your resume will move into as the template engine ships."
      />
    </main>
  );
}
