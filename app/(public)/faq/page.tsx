import type { Metadata } from "next";
import FinalCta from "@/components/public/final-cta";
import PageIntro from "@/components/public/page-intro";
import { faqItems } from "@/lib/content/faq";
import { pageMetadata } from "@/lib/seo";
import { containerClass } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Resume Builder FAQ",
  description:
    "Answers about guest resumes, accounts, templates, downloads, saving, and how Resonance stores information.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <main id="main-content">
      <PageIntro
        eyebrow="FAQ"
        title="Questions, answered in plain language."
        description="These answers match how Resonance is actually built: public pages now, guest editing next, saved resumes for registered accounts after that."
      />

      <section className="border-t border-cream-dark/60 bg-cream-light/30">
        <div className={`${containerClass} space-y-4 py-14 sm:py-20`}>
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border border-cream-dark/60 bg-cream px-5 py-4 open:pb-5"
            >
              <summary className="cursor-pointer list-none font-serif text-lg text-charcoal marker:content-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.question}
                  <span
                    aria-hidden
                    className="mt-1 text-olive transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-charcoal/70">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <FinalCta
        title="Still ready to start?"
        description="Create a resume when you want to write. Sign in if you already have an account."
      />
    </main>
  );
}
