"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness, FileText, LayoutTemplate, Sparkles } from "lucide-react";
import DashboardResumeOverview from "@/components/dashboard/dashboard-resume-overview";
import { useDashboardSession, useDisplayName } from "@/components/dashboard/dashboard-session";
import { publishedTemplateCountQueryOptions } from "@/lib/templates/client-cache";

export default function DashboardHome() {
  const { userId } = useDashboardSession();
  const displayName = useDisplayName();
  const { data: templateCount } = useQuery(publishedTemplateCountQueryOptions);

  return (
    <>
      <DashboardResumeOverview displayName={displayName} userId={userId} templateCount={templateCount} />

      <section className="mt-10" aria-labelledby="career-tools-heading">
        <div className="mb-4"><h2 id="career-tools-heading" className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">Career Tools</h2><p className="mt-1 text-sm text-charcoal/60">Explore a role or check how ATS-friendly a resume is.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ShortcutCard href="/dashboard/career-tools/ats-analysis" icon={<Sparkles className="h-5 w-5" aria-hidden="true" />} title="ATS Analysis" text="Check a saved resume’s ATS compatibility and review improvements." />
          <ShortcutCard href="/dashboard/career-tools/job-analysis" icon={<BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />} title="Job Analysis" text="Understand the skills and requirements in a job posting." />
        </div>
      </section>

      {/* Shortcuts */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Shortcuts">
        <ShortcutCard
          href="/dashboard/templates"
          icon={<LayoutTemplate className="h-5 w-5" aria-hidden="true" />}
          title="Browse templates"
          text="Preview every design and start a resume with the one you like."
        />
        <ShortcutCard
          href="/dashboard/resumes"
          icon={<FileText className="h-5 w-5" aria-hidden="true" />}
          title="Manage my resumes"
          text="Rename, download or delete any of your saved resumes."
        />
      </section>
    </>
  );
}

function ShortcutCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-lg border border-cream-dark bg-cream-light p-5 transition-colors hover:border-olive/50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-olive/10 text-olive">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-charcoal">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-charcoal/60">{text}</span>
      </span>
    </Link>
  );
}
