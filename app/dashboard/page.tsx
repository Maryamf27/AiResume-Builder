import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BarChart3, BriefcaseBusiness, FileText, LayoutTemplate, Sparkles, WandSparkles } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import DashboardResumeOverview from "@/components/dashboard/dashboard-resume-overview";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.fullName ??
    user.email?.split("@")[0] ??
    "there";

  const { count: templateCount } = await supabase
      .from("templates")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);

  return (
    <DashboardShell>
      <DashboardResumeOverview displayName={String(displayName)} userId={user.id} templateCount={templateCount ?? 0} />

      <section className="mt-10" aria-labelledby="career-tools-heading">
        <div className="mb-4"><h2 id="career-tools-heading" className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">Career Tools</h2><p className="mt-1 text-sm text-charcoal/60">Explore a role, compare it with a resume, or check ATS readiness.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ShortcutCard href="/dashboard/career-tools/ats-analysis" icon={<Sparkles className="h-5 w-5" aria-hidden="true" />} title="ATS Analysis" text="Check a saved resume’s ATS compatibility and review improvements." />
          <ShortcutCard href="/dashboard/career-tools/job-analysis" icon={<BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />} title="Job Analysis" text="Understand the skills and requirements in a job posting." />
          <ShortcutCard href="/dashboard/career-tools/job-analysis?view=match" icon={<BarChart3 className="h-5 w-5" aria-hidden="true" />} title="Job Match" text="Compare one of your saved resumes with an analyzed job." />
          <ShortcutCard href="/dashboard/career-tools/job-analysis?view=improvements" icon={<WandSparkles className="h-5 w-5" aria-hidden="true" />} title="AI Resume Improvements" text="Review tailored suggestions after matching a resume to a job." />
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
    </DashboardShell>
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
