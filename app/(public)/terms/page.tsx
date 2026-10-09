import type { Metadata } from "next";
import PageIntro from "@/components/public/page-intro";
import { NavTextLink } from "@/components/public/nav-links";
import { pageMetadata } from "@/lib/seo";
import { routes, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: `Terms for using ${SITE_NAME}: accounts, content you provide, templates, downloads, acceptable use, and limits of the service.`,
  path: "/terms",
});

const sections = [
  {
    title: "Acceptance of terms",
    body: "By using Resonance you agree to these terms. If you do not agree, do not use the service. These terms describe a software product for creating resumes; they are not legal advice about employment.",
  },
  {
    title: "Use of the service",
    body: "You may use the public website and, when available, the resume editor for lawful personal or professional purposes. You are responsible for the accuracy of information you enter.",
  },
  {
    title: "User accounts",
    body: "An account is optional for starting a resume. If you register, you are responsible for keeping sign-in details confidential and for activity under the account. We may refuse or close accounts that abuse the service.",
  },
  {
    title: "User-provided content",
    body: "You retain rights in the resume text and details you supply. You grant us a limited licence to host, display, and process that content solely to operate the product — for example to show a preview or produce a download.",
  },
  {
    title: "Resume creation",
    body: "The editor is meant to help you assemble a document. We do not guarantee interviews, offers, or that a particular employer will parse a file in a given way.",
  },
  {
    title: "Templates",
    body: "Templates are provided for use inside Resonance. You may export a resume that uses a template. You may not copy the template system, source files, or brand as your own product.",
  },
  {
    title: "Downloads",
    body: "When PDF export is available, downloaded files are yours to send. Rendering can vary slightly across devices and printers. We do not warrant that a download will meet a specific employer's technical checklist.",
  },
  {
    title: "Acceptable use",
    body: "Do not misuse the service: no attempting to break authentication, scrape in a way that harms the product, upload malware, or use the site to impersonate others. Do not submit content you do not have the right to use.",
  },
  {
    title: "Service availability",
    body: "We aim to keep the site available but do not promise uninterrupted access. Features described as planned may change before they ship.",
  },
  {
    title: "Intellectual property",
    body: "The Resonance name, site design, and software remain ours or our licensors'. Your resume content remains yours, subject to the licence above.",
  },
  {
    title: "Limitation of liability",
    body: "To the extent permitted by law, Resonance is provided as-is. We are not liable for lost offers, lost data that you did not store, or indirect damages arising from use of the site. Nothing here excludes liability that cannot be excluded by law.",
  },
  {
    title: "Changes to the service",
    body: "We may change, pause, or discontinue features. Material changes to these terms will be reflected on this page.",
  },
  {
    title: "Termination",
    body: "You may stop using the service at any time. We may suspend access if these terms are broken. Account deletion options will follow the controls we publish in the product.",
  },
  {
    title: "Contact",
    body: "Questions about these terms belong on the Contact page. This document does not invent a registered office or company number.",
  },
];

export default function TermsPage() {
  return (
    <main id="main-content">
      <PageIntro
        eyebrow="Legal"
        title="Terms & Conditions"
        description="The rules for using Resonance, written so a person can read them. They do not invent corporate registrations or jurisdiction clauses we have not chosen."
      />

      <article className="border-t border-cream-dark/60">
        <div className={`mx-auto w-full max-w-3xl px-5 sm:px-8 space-y-10 py-14 sm:py-20`}>
          {sections.map((section) => (
            <section key={section.title} aria-labelledby={section.title}>
              <h2
                id={section.title}
                className="font-serif text-2xl tracking-tight text-charcoal"
              >
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/70 sm:text-base">
                {section.body}
              </p>
            </section>
          ))}
          <p className="text-sm text-charcoal/65">
            See also the{" "}
            <NavTextLink href={routes.privacy} className="text-olive">
              Privacy Policy
            </NavTextLink>
            .
          </p>
        </div>
      </article>
    </main>
  );
}
