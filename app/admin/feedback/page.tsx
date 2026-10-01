import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Check, ChevronDown } from "lucide-react";
import { requireAdmin } from "@/lib/admin/require-admin";

export const metadata: Metadata = { title: "Feedback · Admin" };

const STATUS_OPTIONS = ["new", "reviewed", "resolved"] as const;

async function updateFeedbackStatus(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const rawStatus = String(formData.get("status") ?? "new");
  const status = STATUS_OPTIONS.includes(rawStatus as (typeof STATUS_OPTIONS)[number])
    ? (rawStatus as (typeof STATUS_OPTIONS)[number])
    : "new";

  if (!id) {
    redirect("/admin/feedback");
  }

  const { supabase } = await requireAdmin();
  await supabase.from("feedback").update({ status }).eq("id", id);

  redirect("/admin/feedback");
}

function FeedbackIdentity({
  fullName,
  email,
  fallback,
}: {
  fullName: string | null;
  email: string | null;
  fallback: "Account" | "Guest";
}) {
  if (!fullName && !email) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
        {fallback}
      </span>
    );
  }

  return (
    <div className="min-w-0">
      {fullName && <p className="truncate font-medium text-slate-900">{fullName}</p>}
      {email && <p className="truncate text-xs text-slate-500">{email}</p>}
    </div>
  );
}

function FeedbackStatusForm({
  feedbackId,
  status,
}: {
  feedbackId: string;
  status: (typeof STATUS_OPTIONS)[number];
}) {
  return (
    <form action={updateFeedbackStatus} className="flex items-center gap-1">
      <input type="hidden" name="id" value={feedbackId} />
      <div className="relative min-w-0">
        <select
          name="status"
          defaultValue={status}
          className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 shadow-sm outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
      <button
        type="submit"
        title="Save status"
        aria-label="Save status"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-olive text-cream transition-colors hover:bg-olive-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2"
      >
        <Check className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

export default async function FeedbackAdminPage() {
  const { supabase } = await requireAdmin();

  const [{ data: feedbackRows }, { data: profiles }] = await Promise.all([
    supabase
      .from("feedback")
      .select("id, user_id, type, message, page_url, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, email"),
  ]);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const rows = feedbackRows ?? [];

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Feedback</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        Review user reports, bugs, and product suggestions from the public form.
      </p>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-cream-dark bg-cream-light px-6 py-10 text-center text-sm text-charcoal/60">
          No feedback has been submitted yet.
        </div>
      ) : (
        <>
          <ul className="mt-8 space-y-3 xl:hidden">
            {rows.map((row) => {
              const profile = row.user_id ? profileMap.get(row.user_id) : null;
              return (
                <li key={row.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-900">{row.type}</h2>
                      <div className="mt-1">
                        <FeedbackIdentity
                          fullName={profile?.full_name ?? null}
                          email={profile?.email ?? null}
                          fallback={row.user_id ? "Account" : "Guest"}
                        />
                      </div>
                    </div>
                    <time className="shrink-0 text-right text-xs text-slate-500">
                      {new Date(row.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  <p className="mt-4 wrap-break-word whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {row.message}
                  </p>
                  {row.page_url && (
                    <a
                      className="mt-3 inline-block text-sm text-olive underline underline-offset-2 hover:text-olive-dark"
                      href={row.page_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open page
                    </a>
                  )}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Status</span>
                    <FeedbackStatusForm feedbackId={row.id} status={row.status} />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 hidden min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:block">
          <table className="w-full table-fixed text-left text-xs">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[28%]" />
              <col className="w-[9%]" />
              <col className="w-[16%]" />
              <col className="w-[19%]" />
            </colgroup>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-2 py-3 font-medium text-slate-600">Type</th>
                <th className="px-2 py-3 font-medium text-slate-600">User</th>
                <th className="px-2 py-3 font-medium text-slate-600">Message</th>
                <th className="px-2 py-3 font-medium text-slate-600">Page</th>
                <th className="px-2 py-3 font-medium text-slate-600">Created</th>
                <th className="px-2 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const profile = row.user_id ? profileMap.get(row.user_id) : null;
                return (
                  <tr key={row.id} className="border-b border-slate-100 align-top transition-colors hover:bg-slate-50/80 last:border-b-0">
                    <td className="whitespace-nowrap px-2 py-3 text-slate-700">{row.type}</td>
                    <td className="px-2 py-3 text-slate-700">
                      <FeedbackIdentity
                        fullName={profile?.full_name ?? null}
                        email={profile?.email ?? null}
                        fallback={row.user_id ? "Account" : "Guest"}
                      />
                    </td>
                    <td className="wrap-break-word whitespace-pre-wrap px-2 py-3 text-slate-700">
                      {row.message}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-slate-500">
                      {row.page_url ? (
                        <a className="whitespace-nowrap underline underline-offset-2 hover:text-olive" href={row.page_url} target="_blank" rel="noreferrer">
                          Open page
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-slate-500">
                      {new Date(row.created_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-2 py-3">
                      <FeedbackStatusForm feedbackId={row.id} status={row.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
