import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, LayoutTemplate, MousePointerClick, UserPlus, Users } from "lucide-react";
import { requireAdmin } from "@/lib/admin/require-admin";

export const metadata: Metadata = { title: "Overview · Admin" };

// Always fresh: this is a live analytics view.
export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("en-GB");

function shortDay(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();

  const [summaryRes, usageRes, dailyRes, usersRes] = await Promise.all([
    supabase.rpc("admin_summary"),
    supabase.rpc("admin_template_usage"),
    supabase.rpc("admin_daily_activity", { days: 14 }),
    supabase.rpc("admin_user_overview"),
  ]);

  const error = summaryRes.error ?? usageRes.error ?? dailyRes.error ?? usersRes.error;
  const summary = summaryRes.data?.[0];
  const usage = usageRes.data ?? [];
  const daily = dailyRes.data ?? [];
  const recentUsers = (usersRes.data ?? []).slice(0, 5);

  const topTemplates = usage.filter((t) => t.downloaded_count + t.selected_count > 0).slice(0, 6);
  const maxTemplateUse = Math.max(1, ...topTemplates.map((t) => t.downloaded_count));
  const maxDaily = Math.max(1, ...daily.map((d) => Math.max(d.downloads, d.selections)));

  return (
    <div className="w-full min-w-0">
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Admin overview</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        Users, downloads and template usage across the whole app.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load analytics: {error.message}. If this mentions a missing function, run
          migration <code>0006_admin_analytics.sql</code> in the Supabase SQL editor.
        </p>
      )}

      {/* Headline stats */}
      <dl className="mt-6 grid w-full min-w-0 grid-cols-2 gap-3 sm:mt-8 sm:gap-4 xl:grid-cols-3">
        <Stat icon={<Users className="h-3 w-3 sm:h-4 sm:w-4" />} label="Total users" value={summary?.total_users} />
        <Stat icon={<UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />} label="New users (7 days)" value={summary?.new_users_7d} />
        <Stat icon={<FileText className="h-3 w-3 sm:h-4 sm:w-4" />} label="Resumes created" value={summary?.total_resumes} />
        <Stat
          icon={<Download className="h-3 w-3 sm:h-4 sm:w-4" />}
          label="Downloads"
          value={summary?.total_downloads}
          hint={summary ? `${nf.format(summary.guest_downloads)} from guests` : undefined}
        />
        <Stat icon={<MousePointerClick className="h-3 w-3 sm:h-4 sm:w-4" />} label="Template selections" value={summary?.total_selections} />
        <Stat icon={<LayoutTemplate className="h-3 w-3 sm:h-4 sm:w-4" />} label="Published templates" value={summary?.published_templates} />
      </dl>

      <div className="mt-10 w-full min-w-0 grid gap-6 xl:grid-cols-2">
        {/* Most used templates */}
        <section className="rounded-lg border border-cream-dark bg-cream-light p-5" aria-labelledby="top-templates">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="top-templates" className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
              Most used templates
            </h2>
            <Link href="/admin/templates" className="text-sm font-medium text-olive hover:text-olive-dark">
              Manage
            </Link>
          </div>
          {topTemplates.length === 0 ? (
            <p className="py-6 text-center text-sm text-charcoal/55">
              No usage recorded yet. Downloads and selections appear here as people use the builder.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {topTemplates.map((t) => (
                <li key={t.template_id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate font-medium text-charcoal">{t.name}</span>
                    <span className="shrink-0 text-xs text-charcoal/55">
                      {nf.format(t.downloaded_count)} downloads · {nf.format(t.selected_count)} selected
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-dark">
                    <div
                      className="h-full rounded-full bg-olive"
                      style={{ width: `${Math.max(3, (t.downloaded_count / maxTemplateUse) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Daily activity */}
        <section className="rounded-lg border border-cream-dark bg-cream-light p-5" aria-labelledby="daily-activity">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="daily-activity" className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
              Last 14 days
            </h2>
            <span className="flex items-center gap-3 text-xs text-charcoal/55">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-olive" /> Downloads
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-olive/35" /> Selections
              </span>
            </span>
          </div>
          {daily.length === 0 ? (
            <p className="py-6 text-center text-sm text-charcoal/55">No activity data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex h-44 min-w-105 items-end gap-1.5 sm:min-w-full">
                {daily.map((d) => (
                  <div key={d.day} className="flex h-full flex-1 flex-col justify-end" title={`${shortDay(d.day)} — ${d.downloads} downloads, ${d.selections} selections, ${d.signups} signups`}>
                    <div className="flex flex-1 items-end justify-center gap-0.5">
                      <div className="w-full max-w-3 rounded-t-sm bg-olive" style={{ height: `${(d.downloads / maxDaily) * 100}%`, minHeight: d.downloads ? 3 : 0 }} />
                      <div className="w-full max-w-3 rounded-t-sm bg-olive/35" style={{ height: `${(d.selections / maxDaily) * 100}%`, minHeight: d.selections ? 3 : 0 }} />
                    </div>
                    <span className="mt-1.5 truncate text-center text-[10px] text-charcoal/45">
                      {new Date(d.day + "T00:00:00").getDate()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Recent signups */}
      <section className="mt-6 w-full min-w-0 rounded-lg border border-cream-dark bg-cream-light p-5" aria-labelledby="recent-users">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-users" className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">
            Newest users
          </h2>
          <Link href="/admin/users" className="text-sm font-medium text-olive hover:text-olive-dark">
            View all users
          </Link>
        </div>
        {recentUsers.length === 0 ? (
          <p className="py-4 text-center text-sm text-charcoal/55">No users yet.</p>
        ) : (
          <ul className="divide-y divide-cream-dark/70">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-charcoal">{u.full_name || "—"}</p>
                  <p className="truncate text-xs text-charcoal/55">{u.email}</p>
                </div>
                <span className="shrink-0 text-xs text-charcoal/55">
                  Joined {new Date(u.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
  hint?: string;
}) {
  return (
    <div className="w-full min-w-0 rounded-lg border border-cream-dark bg-cream-light p-3 sm:p-4">
      <dt className="flex min-h-7 items-start gap-1.5 text-[10px] font-medium uppercase leading-tight tracking-wide text-charcoal/50 sm:min-h-0 sm:items-center sm:gap-2 sm:text-xs">
        <span className="text-olive">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 font-serif text-2xl text-charcoal sm:mt-2 sm:text-3xl">{value === undefined ? "—" : nf.format(value)}</dd>
      {hint && <p className="mt-1 text-[10px] text-charcoal/50 sm:text-xs">{hint}</p>}
    </div>
  );
}
