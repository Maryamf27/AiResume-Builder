import { redirect } from "next/navigation";
import type { Metadata } from "next";
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
        <div className="mt-8 overflow-x-auto rounded-lg border border-cream-dark bg-cream-light">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-cream-dark bg-cream-light/80">
              <tr>
                <th className="px-4 py-3 font-medium text-charcoal/60">Type</th>
                <th className="px-4 py-3 font-medium text-charcoal/60">User</th>
                <th className="px-4 py-3 font-medium text-charcoal/60">Message</th>
                <th className="px-4 py-3 font-medium text-charcoal/60">Page</th>
                <th className="px-4 py-3 font-medium text-charcoal/60">Created</th>
                <th className="px-4 py-3 font-medium text-charcoal/60">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const profile = row.user_id ? profileMap.get(row.user_id) : null;
                return (
                  <tr key={row.id} className="border-b border-cream-dark/60 align-top last:border-b-0">
                    <td className="px-4 py-3 text-charcoal">{row.type}</td>
                    <td className="px-4 py-3 text-charcoal/80">
                      <div className="max-w-xs">
                        <p className="font-medium text-charcoal">{profile?.full_name ?? "Guest"}</p>
                        <p className="truncate text-xs text-charcoal/55">{profile?.email ?? row.user_id ?? "Anonymous"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal/80">
                      <div className="max-w-xl whitespace-pre-wrap">{row.message}</div>
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">
                      {row.page_url ? (
                        <a className="underline underline-offset-2 hover:text-olive" href={row.page_url} target="_blank" rel="noreferrer">
                          Open page
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-charcoal/70">
                      {new Date(row.created_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateFeedbackStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={row.id} />
                        <select
                          name="status"
                          defaultValue={row.status}
                          className="rounded-md border border-cream-dark bg-cream px-2 py-1.5 text-sm text-charcoal outline-none focus:border-olive"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-md bg-olive px-3 py-1.5 text-sm font-medium text-cream transition-colors hover:bg-olive-dark"
                        >
                          Update
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
