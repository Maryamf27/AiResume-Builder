import type { Metadata } from "next";
import {
  Download,
  Eye,
  FilePenLine,
  FolderOpen,
  LayoutTemplate,
  MonitorSmartphone,
  RefreshCcw,
  Save,
  UserRound,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import FinalCta from "@/components/public/final-cta";
import PageIntro from "@/components/public/page-intro";
import { NavTextLink } from "@/components/public/nav-links";
import { pageMetadata } from "@/lib/seo";
import { containerClass, routes } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Resume Builder Features",
  description:
    "Editing, professional templates, live preview, PDF download, guest creation, and a saved workspace for registered users — explained without the hype.",
  path: "/features",
});

type Feature = {
  title: string;
  body: string;
  status: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const features: Feature[] = [
  {
    title: "Easy resume editing",
    body: "A single place to write experience, education, skills, and contact details. The editor is the product we are building next — this page describes that workspace, not a hidden AI writer.",
    status: "In the editor roadmap",
    Icon: FilePenLine,
  },
  {
    title: "Professional templates",
    body: "Ten layouts chosen for readability and hierarchy, from classic to ATS-friendly. The catalogue is managed in the product rather than frozen in the app.",
    status: "Available now",
    Icon: LayoutTemplate,
  },
  {
    title: "Live preview",
    body: "See the page as you edit so spacing, type, and length stay visible. Preview is planned as a side-by-side view in the builder.",
    status: "Planned with the builder",
    Icon: Eye,
  },
  {
    title: "PDF download",
    body: "Export a print-ready file when you are satisfied with the page. Download is part of the editor workflow, not a claim about hiring outcomes.",
    status: "Planned with the builder",
    Icon: Download,
  },
  {
    title: "Resume information management",
    body: "Keep sections in order: profile, work, education, and skills. Structured fields will make template switching possible without rewriting.",
    status: "Planned with the builder",
    Icon: FolderOpen,
  },
  {
    title: "Template switching",
    body: "Try another layout on the same content. Your details stay in place while the design changes.",
    status: "Available now",
    Icon: RefreshCcw,
  },
  {
    title: "Save and return later",
    body: "Registered accounts will store a resume so you can reopen it on another visit. Sign-in already exists; resume persistence is a later stage.",
    status: "For registered users, upcoming",
    Icon: Save,
  },
  {
    title: "Guest resume creation",
    body: "Start without creating an account. Build, preview, choose a template, and download. An account is for keeping a copy — not a gate at the door.",
    status: "Primary product path",
    Icon: UserRound,
  },
  {
    title: "Responsive experience",
    body: "The public site — and the editor that follows — is meant to work on a laptop, a tablet, and a phone. These marketing pages already follow that rule.",
    status: "Public site available now",
    Icon: MonitorSmartphone,
  },
];

export default function FeaturesPage() {
  return (
    <main id="main-content">
      <PageIntro
        eyebrow="Features"
        title="What Resonance is built to do."
        description="Capabilities below describe the product we are assembling. Where something is still in progress, the copy says so. There are no invented AI features and no hiring guarantees."
      />

      <section className="border-t border-cream-dark/60 bg-cream-light/30">
        <div className={`${containerClass} grid gap-6 py-14 sm:grid-cols-2 sm:py-20 lg:grid-cols-3`}>
          {features.map(({ title, body, status, Icon }) => (
            <article
              key={title}
              className="flex flex-col rounded-lg border border-cream-dark/60 bg-cream p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-olive/10 text-olive">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <h2 className="mt-5 font-serif text-xl tracking-tight text-charcoal">
                {title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-charcoal/70">{body}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.14em] text-olive">
                {status}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-cream-dark/60">
        <div className={`${containerClass} py-12 text-sm text-charcoal/70`}>
          <p>
            Want the layouts?{" "}
            <NavTextLink href={routes.templates} className="text-olive">
              Explore templates
            </NavTextLink>
            . Have a product question?{" "}
            <NavTextLink href={routes.faq} className="text-olive">
              Read the FAQ
            </NavTextLink>
            .
          </p>
        </div>
      </section>

      <FinalCta
        title="Start with the resume, not the account."
        description="Create Resume is the main action. Sign in remains available when you want a saved workspace."
      />
    </main>
  );
}
