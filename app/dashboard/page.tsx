import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileText, LayoutTemplate, Pencil } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import CreateResumeButton from "@/components/dashboard/create-resume-button";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RESUME_TITLE } from "@/lib/resume/constants";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

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

  // Overview only: a count plus the three most recent. The full list lives at /dashboard/resumes.
  const [{ data: recent }, { count: resumeCount }, { count: templateCount }] = await Promise.all([
    supabase
      .from("resumes")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("templates")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
  ]);

  const total = resumeCount ?? recent?.length ?? 0;
  const lastEdited = recent?.[0]?.updated_at;

  return (
    <DashboardShell>
      <div className="w-full min-w-0 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">
            Good to see you, {String(displayName)}
          </h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Pick up where you left off, or start something new.
          </p>
        </div>
        <CreateResumeButton />
      </div>

      {/* At-a-glance numbers */}
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Resumes" value={String(total)} />
        <Stat label="Last edited" value={lastEdited ? formatDate(lastEdited) : "—"} />
        <Stat label="Templates available" value={String(templateCount ?? 0)} />
      </dl>

      {/* Recent activity */}
      <section className="mt-10" aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="recent-heading"
            className="text-sm font-semibold uppercase tracking-wide text-charcoal/50"
          >
            Recent resumes
          </h2>
          {total > 0 && (
            <Link
              href="/dashboard/resumes"
              className="inline-flex items-center gap-1 text-sm font-medium text-olive hover:text-olive-dark"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        {recent && recent.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/builder?id=${r.id}`}
                  className="group flex items-center justify-between gap-4 rounded-lg border border-cream-dark bg-cream-light p-4 transition-colors hover:border-olive/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-charcoal">
                      {r.title || DEFAULT_RESUME_TITLE}
                    </p>
                    <p className="mt-1 text-xs text-charcoal/55">
                      Updated {formatDate(r.updated_at)}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-charcoal/60 group-hover:text-olive">
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Continue
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-cream-dark bg-cream-light px-6 py-10 text-center">
            <FileText className="mx-auto h-7 w-7 text-charcoal/30" aria-hidden="true" />
            <p className="mt-3 text-sm text-charcoal/65">
              No resumes yet. Create your first one to get started.
            </p>
          </div>
        )}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-cream-dark bg-cream-light p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-charcoal/50">{label}</dt>
      <dd className="mt-1.5 font-serif text-2xl text-charcoal">{value}</dd>
    </div>
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
