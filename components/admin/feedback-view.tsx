"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import AdminPageSkeleton from "@/components/admin/page-skeleton";
import Select from "@/components/ui/select";
import { adminKeys, adminQueryOptions, type AdminFeedbackData } from "@/lib/admin/queries";
import { createClient } from "@/lib/supabase/client";

const STATUS_OPTIONS = ["new", "reviewed", "resolved"] as const;
type FeedbackStatus = (typeof STATUS_OPTIONS)[number];

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

function FeedbackStatusForm({ feedbackId, status }: { feedbackId: string; status: FeedbackStatus }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<FeedbackStatus>(status);
  const [failed, setFailed] = useState(false);

  const save = useMutation({
    mutationFn: async (next: FeedbackStatus) => {
      const { error } = await createClient().from("feedback").update({ status: next }).eq("id", feedbackId);
      if (error) throw new Error(error.message);
      return next;
    },
    onMutate: () => setFailed(false),
    onSuccess: (next) => {
      // Update the cached list in place: the change shows everywhere at once, no refetch needed.
      queryClient.setQueryData<AdminFeedbackData>(adminKeys.feedback, (old) =>
        old ? { ...old, rows: old.rows.map((row) => (row.id === feedbackId ? { ...row, status: next } : row)) } : old
      );
    },
    onError: () => setFailed(true),
  });

  const unchanged = draft === status;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!unchanged && !save.isPending) save.mutate(draft);
      }}
      className="flex items-center gap-2"
    >
      <Select
        value={draft}
        onChange={(value) => setDraft(value as FeedbackStatus)}
        options={STATUS_OPTIONS}
        aria-label="Feedback status"
        capitalize
        className="flex-1"
      />
      <button
        type="submit"
        disabled={unchanged || save.isPending}
        title={failed ? "Couldn't save — try again" : "Save status"}
        aria-label="Save status"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-olive text-cream transition-colors hover:bg-olive-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
      </button>
      {failed && <span role="alert" className="text-xs text-destructive">Not saved</span>}
    </form>
  );
}

export default function AdminFeedbackView() {
  const { data, isPending, error } = useQuery(adminQueryOptions.feedback);
  if (isPending) return <AdminPageSkeleton />;

  const profileMap = new Map((data?.profiles ?? []).map((profile) => [profile.id, profile]));
  const rows = data?.rows ?? [];

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Feedback</h1>
      <p className="mt-2 text-sm text-charcoal/60">
        Review user reports, bugs, and product suggestions from the public form.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load feedback: {error.message}
        </p>
      )}

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
                    <FeedbackStatusForm feedbackId={row.id} status={row.status as FeedbackStatus} />
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
                      <FeedbackStatusForm feedbackId={row.id} status={row.status as FeedbackStatus} />
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
