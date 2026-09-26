import type { Metadata } from "next";
import PageIntro from "@/components/public/page-intro";
import ButtonLink from "@/components/ui/button-link";
import { NavTextLink } from "@/components/public/nav-links";
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
        title="A straightforward way to get in touch."
        description="This page is the public front door for product questions. We do not list a support inbox here that does not exist. For account access, use Sign In."
      />

      <section className="border-t border-cream-dark/60 bg-cream-light/30">
        <div className={`${containerClass} grid gap-6 py-14 sm:grid-cols-2 sm:py-20`}>
          <article className="rounded-lg border border-cream-dark/60 bg-cream p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-charcoal">Product questions</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/70">
              If you are wondering how guest editing, templates, or accounts
              will work, the{" "}
              <NavTextLink href={routes.faq} className="text-olive">
                FAQ
              </NavTextLink>{" "}
              and{" "}
              <NavTextLink href={routes.features} className="text-olive">
                features
              </NavTextLink>{" "}
              pages are the most accurate public descriptions right now.
            </p>
          </article>
          <article className="rounded-lg border border-cream-dark/60 bg-cream p-6 sm:p-8">
            <h2 className="font-serif text-2xl text-charcoal">Already using an account?</h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/70">
              Sign in to reach your workspace. Resume saving and a fuller
              dashboard are still ahead; authentication itself is already in
              place.
            </p>
            <div className="mt-6">
              <ButtonLink href={routes.signIn} variant="outline" size="md">
                Sign In
              </ButtonLink>
            </div>
          </article>
        </div>
      </section>

      <section
        id="report"
        className="scroll-mt-20 border-t border-cream-dark/60"
        aria-labelledby="report-heading"
      >
        <div className={`${containerClass} py-14 sm:py-20`}>
          <div className="max-w-2xl rounded-xl border border-cream-dark/60 bg-cream-light p-6 sm:p-8">
            <h2 id="report-heading" className="font-serif text-2xl text-charcoal">
              Product support
            </h2>
            <p className="mt-3 text-sm leading-6 text-charcoal/70">
              When something breaks — a page, a sign-in step, or later the
              editor — we want a dedicated place to hear about it. That report
              form is the next phase of the site. It is not collecting messages
              from this page yet.
            </p>
            <p className="mt-6">
              <a
                href="#report"
                className="inline-flex min-h-11 items-center rounded-md border border-olive/30 bg-olive/10 px-5 text-sm font-medium text-olive transition-colors hover:bg-olive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
              >
                Have a problem? Report it here.
              </a>
            </p>
            <p className="mt-3 text-xs leading-5 text-charcoal/55">
              Placeholder for the upcoming report flow. No form is submitted
              from this button today.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
