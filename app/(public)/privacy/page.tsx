import type { Metadata } from "next";
import PageIntro from "@/components/public/page-intro";
import { NavTextLink } from "@/components/public/nav-links";
import { pageMetadata } from "@/lib/seo";
import { routes, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${SITE_NAME} thinks about account data, resume content, usage information, storage, and your choices. General wording — not a claim of specific certifications.`,
  path: "/privacy",
});

const sections = [
  {
    title: "Information collected",
    body: "What we collect depends on how you use the product. Browsing these public pages is different from creating an account or, later, saving a resume.",
  },
  {
    title: "Account information",
    body: "If you create an account, we store the details you provide at sign-up — such as email address and name — through our authentication provider. Passwords are handled by that provider, not displayed back to you in this application.",
  },
  {
    title: "Resume information",
    body: "These public pages do not collect resume content. When guest editing and saved resumes ship, resume text you enter will be used to render and, if you choose, store your document. We do not use this policy to claim that resume saving is already live.",
  },
  {
    title: "Usage information",
    body: "Standard technical data may be processed to operate the site — for example, security logs or hosting telemetry from our infrastructure. We are not describing a separate advertising profile, and we have not published a list of analytics vendors here because a dedicated analytics product is not part of this phase.",
  },
  {
    title: "How information is used",
    body: "Account data is used to authenticate you, protect your session, and (when resume saving exists) associate documents with the correct person. We do not sell personal information.",
  },
  {
    title: "Data storage",
    body: "Application data is stored with our hosting and database providers. We do not publish retention periods in this policy because those periods have not been formally set in product documentation.",
  },
  {
    title: "Security",
    body: "We use industry-typical measures such as encrypted connections in production and access rules in the database so one account cannot read another account's profile. No method of transmission or storage is perfectly secure, and this page does not claim a named certification.",
  },
  {
    title: "Third-party services",
    body: "The product relies on infrastructure for hosting, authentication, and the database. Those providers process data according to their own terms. We do not list invented vendor names beyond what the running application already uses.",
  },
  {
    title: "Cookies and local storage",
    body: "Sign-in uses cookies (or similar browser storage) to keep a session. The public marketing pages do not require an account cookie. We may use local storage in later editor work so a guest draft can survive a refresh — that behavior will be described here when it ships.",
  },
  {
    title: "Your rights",
    body: "Depending on where you live, you may have rights to access, correct, or delete personal information we hold. You can use in-product account controls where they exist, or contact us through the Contact page. We will not invent a postal address or email that is not published elsewhere on the site.",
  },
  {
    title: "Policy changes",
    body: "If this policy changes in a material way, we will update this page. Continued use of the service after an update means you are looking at the current version.",
  },
  {
    title: "Contact",
    body: "Questions about privacy should go through the Contact page. We do not invent a privacy officer email on this document.",
  },
];

export default function PrivacyPage() {
  return (
    <main id="main-content">
      <PageIntro
        eyebrow="Legal"
        title="Privacy Policy"
        description="A readable outline of how Resonance handles information. It is not a substitute for counsel, and it does not invent certifications, office addresses, or retention clocks we have not established."
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
            Related:{" "}
            <NavTextLink href={routes.terms} className="text-olive">
              Terms &amp; Conditions
            </NavTextLink>{" "}
            and{" "}
            <NavTextLink href={routes.contact} className="text-olive">
              Contact
            </NavTextLink>
            .
          </p>
        </div>
      </article>
    </main>
  );
}
