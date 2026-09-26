import Button from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import {
  FileText,
  Eye,
  Download,
  Sparkles,
  Menu,
  MapPin,
  Mail,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

const container = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";

type Feature = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
};

const features: Feature[] = [
  {
    Icon: FileText,
    title: "Editorial templates",
    body: "Calibrated layouts that feel crafted, not generated.",
  },
  {
    Icon: Eye,
    title: "Live preview",
    body: "Edit with a precise, side-by-side view of every page.",
  },
  {
    Icon: Download,
    title: "PDF export",
    body: "Crisp, print-ready documents that render consistently.",
  },
  {
    Icon: Sparkles,
    title: "Considered AI",
    body: "Writing assistance that preserves your voice.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-10 border-b border-cream-dark/60 bg-cream/80 backdrop-blur-sm">
        <div className={`${container} flex h-16 items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-md bg-olive text-cream"
            >
              <FileText className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="font-serif text-lg tracking-tight text-charcoal">
              Resonance
            </span>
          </div>
          <nav
            aria-label="Primary"
            className="hidden items-center gap-8 md:flex"
          >
            <a
              href="#templates"
              className="text-sm text-charcoal/80 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Templates
            </a>
            <a
              href="#pricing"
              className="text-sm text-charcoal/80 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Pricing
            </a>
            <a
              href="#signin"
              className="text-sm text-charcoal/80 transition-colors hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Sign in
            </a>
          </nav>
          <div className="md:hidden">
            <IconButton
              aria-label="Open navigation menu"
              variant="ghost"
              size="sm"
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </IconButton>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className={`${container} pt-16 pb-14 sm:pt-24 sm:pb-20`}>
            <div className="flex flex-col items-start gap-10 lg:grid lg:grid-cols-12 lg:gap-16">
              <div className="w-full lg:col-span-7">
                <div className="mb-6">
                  <Badge variant="default">
                    Editorial design, built for careers.
                  </Badge>
                </div>
                <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-charcoal sm:text-5xl md:text-6xl">
                  Build a resume worth remembering.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-charcoal/70 sm:text-lg sm:leading-8">
                  Editorial templates, live preview, and a writing assistant —
                  everything you need to craft a professional resume, without
                  the generic SaaS feel.
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <Button variant="primary" size="lg" type="button">
                    Create Resume
                  </Button>
                  <Button variant="outline" size="lg" type="button">
                    View Templates
                  </Button>
                </div>
              </div>

              <div className="w-full lg:col-span-5">
                <ResumePreviewCard />
              </div>
            </div>
          </div>
        </section>

        <section
          id="templates"
          aria-label="Features"
          className="border-t border-cream-dark/60 bg-cream-light/40"
        >
          <div className={`${container} py-14 sm:py-20`}>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-olive">
                Designed for substance
              </p>
              <h2 className="mt-4 font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
                The tools your career deserves.
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {features.map(({ Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-lg border border-cream-dark/60 bg-cream-light p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-olive/10 text-olive">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-5 font-serif text-xl tracking-tight text-charcoal">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-charcoal/70">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-cream-dark/60 bg-cream">
          <div className={`${container} py-14 sm:py-16`}>
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="font-serif text-2xl tracking-tight text-charcoal sm:text-3xl">
                Ready when you are.
              </h2>
              <p className="max-w-lg text-sm leading-6 text-charcoal/70 sm:text-base">
                A considered foundation for professional resumes — templates,
                preview, and export, from your first draft to your final PDF.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button variant="primary" size="md" type="button">
                  Create Resume
                </Button>
                <Button variant="ghost" size="md" type="button">
                  View Templates
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-cream-dark/60 bg-cream-light/40">
        <div
          className={`${container} flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center`}
        >
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-md bg-olive text-cream"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="font-serif text-sm tracking-tight text-charcoal">
              Resonance
            </span>
          </div>
          <p className="text-xs text-charcoal/60">
            {new Date().getFullYear()} Resonance. Editorial resume foundation.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ResumePreviewCard() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-x-3 -top-3 bottom-4 rounded-xl bg-olive/10"
      />
      <Card className="relative w-full overflow-hidden border-cream-dark shadow-none">
        <CardHeader className="border-b border-olive/10 bg-cream">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">Amelia Carter</CardTitle>
              <CardDescription className="mt-2 text-sm">
                Senior Product Designer · Remote
              </CardDescription>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-charcoal/65">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    className="h-3.5 w-3.5 text-olive"
                    strokeWidth={2}
                  />
                  Lisbon, Portugal
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail
                    className="h-3.5 w-3.5 text-olive"
                    strokeWidth={2}
                  />
                  amelia@studioac.studio
                </span>
              </div>
            </div>
            <Badge variant="olive" className="whitespace-nowrap text-[10px]">
              PDF ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          <div>
            <h3 className="font-serif text-sm uppercase tracking-[0.18em] text-olive">
              Experience
            </h3>
            <div className="mt-3 space-y-3 border-t border-olive/10 pt-3">
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-charcoal">
                    Lead Product Designer · Halcyon
                  </p>
                  <p className="text-xs text-charcoal/55">2023 — Present</p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-charcoal/70">
                  Led the end-to-end redesign of the reporting suite, adopted
                  by 12k+ users in its first quarter.
                </p>
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium text-charcoal">
                    Product Designer · Meridian Labs
                  </p>
                  <p className="text-xs text-charcoal/55">2020 — 2023</p>
                </div>
                <p className="mt-1.5 text-xs leading-5 text-charcoal/70">
                  Shipped the onboarding redesign, lifting activation by 28
                  percentage points across three plans.
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-sm uppercase tracking-[0.18em] text-olive">
              Education
            </h3>
            <div className="mt-3 space-y-3 border-t border-olive/10 pt-3">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-charcoal">
                    BA Interaction Design
                  </p>
                  <p className="text-xs text-charcoal/60">
                    London College of Communication
                  </p>
                </div>
                <p className="text-xs text-charcoal/55">2016 — 2019</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-sm uppercase tracking-[0.18em] text-olive">
              Skills
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 border-t border-olive/10 pt-3">
              <Badge variant="outline">Design systems</Badge>
              <Badge variant="outline">Research</Badge>
              <Badge variant="outline">Prototyping</Badge>
              <Badge variant="outline">Figma</Badge>
              <Badge variant="outline">Facilitation</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
