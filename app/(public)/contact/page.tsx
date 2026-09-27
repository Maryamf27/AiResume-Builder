import type { Metadata } from "next";
import PageIntro from "@/components/public/page-intro";
import FeedbackForm from "@/components/feedback/feedback-form";
import ButtonLink from "@/components/ui/button-link";
import { pageMetadata } from "@/lib/seo";
import { containerClass, routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "How to reach Resonance about the product, and where problem reporting will live when the feedback flow opens.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main id="main-content">
      <PageIntro
        eyebrow="Contact"
        title="How can we help?"
        description="Report a bug, request a feature, or share feedback. No account is required, and every message helps us make Resonance better."
      />

      <section id="report" className="scroll-mt-20 border-t border-cream-dark/60 bg-cream-light/30" aria-labelledby="report-heading">
        <div className={`${containerClass} grid gap-10 py-14 lg:grid-cols-[1fr_1.35fr] lg:py-20`}>
          <div>
            <h2 id="report-heading" className="font-serif text-3xl text-charcoal">Tell us what&apos;s on your mind.</h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-charcoal/70">Whether something is not working or you have an idea for the future, send it our way.</p>
            <div className="mt-8 flex flex-col gap-4">
              <p className="text-sm leading-6 text-charcoal/70"><strong className="font-medium text-charcoal">Bug Report.</strong> Something isn&apos;t working as expected.</p>
              <p className="text-sm leading-6 text-charcoal/70"><strong className="font-medium text-charcoal">Feature Request.</strong> Suggest an improvement or new capability.</p>
              <p className="text-sm leading-6 text-charcoal/70"><strong className="font-medium text-charcoal">General Feedback.</strong> Tell us what you think about the experience.</p>
            </div>
            <div className="mt-8"><ButtonLink href={routes.faq} variant="outline" size="md">Browse the FAQ</ButtonLink></div>
          </div>
          <div className="rounded-lg border border-cream-dark/60 bg-cream p-6 shadow-sm sm:p-8">
            <FeedbackForm />
          </div>
        </div>
      </section>
    </main>
  );
}
