import type { Metadata } from "next";
import {
  Briefcase,
  Download,
  Eye,
  FilePenLine,
  LayoutTemplate,
  UserRound,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import Badge from "@/components/ui/badge";
import ButtonLink from "@/components/ui/button-link";
import FinalCta from "@/components/public/final-cta";
import ResumePreviewCard from "@/components/public/resume-preview-card";
import { NavTextLink } from "@/components/public/nav-links";
import { faqPreviewItems } from "@/lib/content/faq";
import {
  containerClass,
  routes,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE_NAME} | Create a Professional Resume`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: routes.home },
  openGraph: {
    title: `${SITE_NAME} | Create a Professional Resume`,
    description: SITE_DESCRIPTION,
    url: routes.home,
    type: "website",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Create a Professional Resume`,
    description: SITE_DESCRIPTION,
  },
};

type Step = {
  number: string;
  title: string;
  body: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const steps: Step[] = [
  {
    number: "01",
    title: "Start your resume",
    body: "Open the editor and begin. You do not need an account to get the first draft on the page.",
    Icon: FilePenLine,
  },
  {
    number: "02",
    title: "Add your experience and skills",
    body: "Fill in the work that actually happened — roles, projects, and the skills you use.",
    Icon: Briefcase,
  },
  {
    number: "03",
    title: "Choose your template",
    body: "Pick a professional layout and switch later without rewriting your content.",
    Icon: LayoutTemplate,
  },
  {
    number: "04",
    title: "Preview and download",
    body: "Review the page as it will print, then export a PDF when you are ready to send it.",
    Icon: Download,
  },
];

const homeFeatures: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
}[] = [
  {
    Icon: FilePenLine,
    title: "Straightforward editing",
    body: "A calm workspace for the facts of your career — not a maze of settings.",
  },
  {
    Icon: LayoutTemplate,
    title: "Professional templates",
    body: "Layouts meant to be read by a person first, then by whatever system sits in between.",
  },
  {
    Icon: Eye,
    title: "Live preview",
    body: "See the page take shape as you write, so spacing and hierarchy stay honest.",
  },
  {
    Icon: UserRound,
    title: "Start as a guest",
    body: "Build, preview, choose a template, and download. Create an account when you want to save.",
  },
];

export default function HomePage() {
  return (
    <main id="main-content">
      <section className="relative overflow-hidden">
        <div className={`${containerClass} pt-16 pb-14 sm:pt-24 sm:pb-20`}>
          <div className="flex flex-col items-start gap-10 lg:grid lg:grid-cols-12 lg:gap-16">
            <div className="w-full lg:col-span-7">
              <div className="mb-6">
                <Badge variant="default">Editorial design, built for careers.</Badge>
              </div>
              <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-charcoal sm:text-5xl md:text-6xl">
                {SITE_TAGLINE}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-charcoal/70 sm:text-lg sm:leading-8">
                Create a professional resume with modern templates and a live
                editing experience. Write in your own voice. Adjust the layout
                when you need to. Download when it is ready.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={routes.createResume} variant="primary" size="lg">
                  Create Resume
                </ButtonLink>
                <ButtonLink href={routes.templates} variant="outline" size="lg">
                  Explore Templates
                </ButtonLink>
              </div>
            </div>
            <div className="w-full lg:col-span-5">
              <ResumePreviewCard />
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t border-cream-dark/60 bg-cream-light/40"
        aria-labelledby="how-it-works-heading"
      >
        <div className={`${containerClass} py-14 sm:py-20`}>
          <p className="text-xs uppercase tracking-[0.2em] text-olive">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-4 max-w-2xl font-serif text-3xl tracking-tight text-charcoal sm:text-4xl"
          >
            Four steps from a blank page to a document you can send.
          </h2>
          <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ number, title, body, Icon }) => (
              <li
                key={number}
                className="rounded-lg border border-cream-dark/60 bg-cream p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm text-olive">{number}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-olive/10 text-olive">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                </div>
                <h3 className="mt-6 font-serif text-xl tracking-tight text-charcoal">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/70">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="border-t border-cream-dark/60 bg-cream"
        aria-labelledby="features-heading"
      >
        <div className={`${containerClass} py-14 sm:py-20`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-olive">
                What you get
              </p>
              <h2
                id="features-heading"
                className="mt-4 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl"
              >
                Tools that stay out of the way.
              </h2>
            </div>
            <NavTextLink href={routes.features} className="text-sm text-olive">
              See all features
            </NavTextLink>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {homeFeatures.map(({ Icon, title, body }) => (
              <article
                key={title}
                className="rounded-lg border border-cream-dark/60 bg-cream-light p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-olive/10 text-olive">
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <h3 className="mt-5 font-serif text-xl tracking-tight text-charcoal">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/70">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-t border-cream-dark/60 bg-cream-light/40"
        aria-labelledby="templates-heading"
      >
        <div className={`${containerClass} py-14 sm:py-20`}>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <p className="text-xs uppercase tracking-[0.2em] text-olive">
                Templates
              </p>
              <h2
                id="templates-heading"
                className="mt-4 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl"
              >
                Professional designs, ready to choose from.
              </h2>
              <p className="mt-4 text-base leading-7 text-charcoal/70">
                Ten considered layouts, from a traditional classic to a plain
                ATS-friendly page. Pick one in the editor and switch it later
                without starting over.
              </p>
              <div className="mt-8">
                <ButtonLink href={routes.templates} variant="outline" size="md">
                  Browse templates
                </ButtonLink>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:col-span-7">
              {["Editorial", "Structured", "Quiet", "Classic"].map((label) => (
                <div
                  key={label}
                  className="aspect-[3/4] rounded-lg border border-cream-dark/70 bg-cream p-4"
                >
                  <div className="h-2 w-1/3 rounded-sm bg-olive/30" />
                  <div className="mt-4 space-y-2">
                    <div className="h-1.5 w-full rounded-sm bg-charcoal/10" />
                    <div className="h-1.5 w-5/6 rounded-sm bg-charcoal/10" />
                    <div className="h-1.5 w-2/3 rounded-sm bg-charcoal/10" />
                  </div>
                  <p className="mt-auto pt-8 text-xs uppercase tracking-[0.16em] text-charcoal/45">
                    {label} direction
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t border-cream-dark/60 bg-cream"
        aria-labelledby="guest-heading"
      >
        <div className={`${containerClass} py-14 sm:py-20`}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-olive">
              Guest-first
            </p>
            <h2
              id="guest-heading"
              className="mt-4 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl"
            >
              Start building for free. No account required.
            </h2>
            <p className="mt-5 text-base leading-7 text-charcoal/70">
              You can start building your resume immediately. Write your
              experience, preview the page, choose a template, and download the
              file. Create an account later if you want to save the resume and
              return to it.
            </p>
          </div>
        </div>
      </section>

      <section
        className="border-t border-cream-dark/60 bg-cream-light/40"
        aria-labelledby="faq-preview-heading"
      >
        <div className={`${containerClass} py-14 sm:py-20`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-olive">FAQ</p>
              <h2
                id="faq-preview-heading"
                className="mt-4 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl"
              >
                Straight answers.
              </h2>
            </div>
            <NavTextLink href={routes.faq} className="text-sm text-olive">
              Read the full FAQ
            </NavTextLink>
          </div>
          <div className="mt-10 space-y-4">
            {faqPreviewItems.map((item) => (
              <article
                key={item.question}
                className="rounded-lg border border-cream-dark/60 bg-cream px-5 py-5"
              >
                <h3 className="font-serif text-lg text-charcoal">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-charcoal/70">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FinalCta
        id="create-resume"
        title="Ready when you are."
        description="Open the resume flow and start writing. Sign in stays available in the corner — it is not the path you have to take first."
      />
    </main>
  );
}
