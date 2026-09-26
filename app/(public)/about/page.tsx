import type { Metadata } from "next";
import PageIntro from "@/components/public/page-intro";
import FinalCta from "@/components/public/final-cta";
import { containerClass } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "Resonance is a resume builder focused on simple creation, professional presentation, and editing that stays out of the way.",
  path: "/about",
});

const audiences = [
  {
    title: "People changing roles",
    body: "You need a document that explains recent work clearly, without a week of formatting.",
  },
  {
    title: "People early in their career",
    body: "You have real experience — internships, projects, part-time work — and need a layout that treats it with care.",
  },
  {
    title: "People who already know their story",
    body: "You do not need a generator to invent a biography. You need a place to put the work on the page.",
  },
];

export default function AboutPage() {
  return (
    <main id="main-content">
      <PageIntro
        eyebrow="About"
        title="A quieter way to make a resume."
        description="Resonance exists so you can put your work on the page without fighting a template, a dashboard, or a sign-up wall. The product is the resume — not an account funnel."
      />

      <section
        className="border-t border-cream-dark/60 bg-cream-light/40"
        aria-labelledby="purpose-heading"
      >
        <div className={`${containerClass} grid gap-10 py-14 sm:py-20 lg:grid-cols-2`}>
          <div>
            <h2
              id="purpose-heading"
              className="font-serif text-3xl tracking-tight text-charcoal"
            >
              Purpose
            </h2>
            <p className="mt-4 text-base leading-7 text-charcoal/70">
              Most resume tools either lock the design down so tightly you
              cannot think, or scatter the writing across so many screens that
              the document never feels like yours. Resonance is built around a
              single job: help you create a professional resume you are willing
              to send.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-3xl tracking-tight text-charcoal">
              The problem
            </h2>
            <p className="mt-4 text-base leading-7 text-charcoal/70">
              Formatting should not be the hard part. Neither should creating an
              account before you have written a sentence. People stall on
              resumes because the tools ask for too much, too early, and look
              like every other product on the internet.
            </p>
          </div>
        </div>
      </section>

      <section
        className="border-t border-cream-dark/60"
        aria-labelledby="focus-heading"
      >
        <div className={`${containerClass} py-14 sm:py-20`}>
          <h2
            id="focus-heading"
            className="font-serif text-3xl tracking-tight text-charcoal"
          >
            What we focus on
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            <li className="rounded-lg border border-cream-dark/60 bg-cream-light p-6">
              <h3 className="font-serif text-xl text-charcoal">Simple creation</h3>
              <p className="mt-2 text-sm leading-6 text-charcoal/70">
                Start without an account. Add experience, education, and skills
                in an editor that behaves like a document, not a form wizard.
              </p>
            </li>
            <li className="rounded-lg border border-cream-dark/60 bg-cream-light p-6">
              <h3 className="font-serif text-xl text-charcoal">
                Professional presentation
              </h3>
              <p className="mt-2 text-sm leading-6 text-charcoal/70">
                Templates are editorial: cream, type, and space. The aim is a
                page a hiring manager can actually read.
              </p>
            </li>
            <li className="rounded-lg border border-cream-dark/60 bg-cream-light p-6">
              <h3 className="font-serif text-xl text-charcoal">Ease of editing</h3>
              <p className="mt-2 text-sm leading-6 text-charcoal/70">
                Live preview, template switching, and download sit next to the
                writing — so you can adjust without starting over.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section
        className="border-t border-cream-dark/60 bg-cream-light/40"
        aria-labelledby="who-heading"
      >
        <div className={`${containerClass} py-14 sm:py-20`}>
          <h2
            id="who-heading"
            className="font-serif text-3xl tracking-tight text-charcoal"
          >
            Who it is for
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {audiences.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-cream-dark/60 bg-cream p-6"
              >
                <h3 className="font-serif text-xl text-charcoal">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/70">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FinalCta
        title="Begin with the work you have."
        description="Create a resume when you are ready. Sign in only if you want a saved copy."
      />
    </main>
  );
}
