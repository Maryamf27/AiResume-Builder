import Link from "next/link";
import { BarChart3, BriefcaseBusiness, Sparkles, WandSparkles } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";

const tools = [
  {
    href: "/dashboard/career-tools/ats-analysis",
    title: "ATS Analysis",
    description: "Check a saved resume’s ATS compatibility and review improvements.",
    icon: Sparkles,
  },
  {
    href: "/dashboard/career-tools/job-analysis",
    title: "Job Analysis",
    description: "Understand the skills and requirements in a job posting.",
    icon: BriefcaseBusiness,
  },
  {
    href: "/dashboard/career-tools/job-analysis?view=match",
    title: "Job Match",
    description: "Compare one of your saved resumes with an analyzed job.",
    icon: BarChart3,
  },
  {
    href: "/dashboard/career-tools/job-analysis?view=improvements",
    title: "AI Resume Improvements",
    description: "Review tailored suggestions after matching a resume to a job.",
    icon: WandSparkles,
  },
];

export default function CareerToolsPage() {
  return (
    <DashboardShell>
      <main className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Career Tools</p>
          <h1 className="mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">Choose a tool</h1>
          <p className="mt-2 text-sm text-charcoal/65">Explore a role, compare it with a resume, or check ATS readiness.</p>
        </header>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2" aria-label="Career tools">
          {tools.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-lg border border-cream-dark bg-cream-light p-5 transition-colors hover:border-olive/40 hover:bg-white"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-olive/10 text-olive">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-semibold text-charcoal group-hover:text-olive-dark">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-charcoal/65">{description}</p>
            </Link>
          ))}
        </section>
      </main>
    </DashboardShell>
  );
}
