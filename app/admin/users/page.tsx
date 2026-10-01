import type { Metadata } from "next";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/admin/require-admin";

export const metadata: Metadata = { title: "Users · Admin" };
export const dynamic = "force-dynamic";

const nf = new Intl.NumberFormat("en-GB");

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase.rpc("admin_user_overview");
  const all = data ?? [];

  const query = (q ?? "").trim().toLowerCase();
  const users = query
    ? all.filter(
        (u) =>
          (u.email ?? "").toLowerCase().includes(query) ||
          (u.full_name ?? "").toLowerCase().includes(query)
      )
    : all;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Users</h1>
          <p className="mt-2 text-sm text-charcoal/60">
            {nf.format(all.length)} registered {all.length === 1 ? "user" : "users"}
            {query && ` · ${nf.format(users.length)} matching “${q}”`}
          </p>
        </div>

        <form role="search" className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name or email"
            aria-label="Search users"
            className="h-10 w-full rounded-md border border-cream-dark bg-cream-light pl-9 pr-3 text-sm text-charcoal outline-none placeholder:text-charcoal/40 focus:border-olive"
          />
        </form>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-md border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load users: {error.message}. If this mentions a missing function, run migration{" "}
          <code>0006_admin_analytics.sql</code>.
        </p>
      )}

      <ul className="mt-6 space-y-3 xl:hidden">
        {users.length === 0 ? (
          <li className="rounded-xl border border-dashed border-cream-dark bg-cream-light px-4 py-8 text-center text-sm text-slate-500">
            {query ? "No users match your search." : "No users yet."}
          </li>
        ) : (
          users.map((u) => (
            <li key={u.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-slate-900">{u.full_name || "—"}</h2>
                  <p className="break-all text-xs text-slate-500">{u.email ?? "no email"}</p>
                </div>
                <span
                  className={
                    u.role === "admin"
                      ? "shrink-0 rounded-full bg-olive/15 px-2 py-0.5 text-xs font-medium text-olive"
                      : "shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                  }
                >
                  {u.role === "admin" ? "Admin" : "User"}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3">
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Joined</dt>
                  <dd className="mt-0.5 text-sm text-slate-700">{fmtDate(u.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Last active</dt>
                  <dd className="mt-0.5 text-sm text-slate-700">{fmtDate(u.last_activity)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Resumes</dt>
                  <dd className="mt-0.5 text-sm tabular-nums text-slate-700">{nf.format(u.resume_count)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Downloads</dt>
                  <dd className="mt-0.5 text-sm tabular-nums text-slate-700">{nf.format(u.downloads)}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Selections</dt>
                  <dd className="mt-0.5 text-sm tabular-nums text-slate-700">{nf.format(u.selections)}</dd>
                </div>
              </dl>
            </li>
          ))
        )}
      </ul>

      <div className="mt-6 hidden min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm xl:block">
        <table className="w-full table-fixed text-left text-xs">
          <colgroup>
            <col className="w-[26%]" />
            <col className="w-[10%]" />
            <col className="w-[13%]" />
            <col className="w-[10%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[17%]" />
          </colgroup>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium text-slate-600">User</th>
              <th className="px-3 py-3 font-medium text-slate-600">Role</th>
              <th className="px-3 py-3 font-medium text-slate-600">Joined</th>
              <th className="px-3 py-3 text-right font-medium text-slate-600">Resumes</th>
              <th className="px-3 py-3 text-right font-medium text-slate-600">Downloads</th>
              <th className="px-3 py-3 text-right font-medium text-slate-600">Selections</th>
              <th className="px-3 py-3 font-medium text-slate-600">Last active</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                  {query ? "No users match your search." : "No users yet."}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 last:border-0">
                  <td className="px-3 py-3">
                    <div className="truncate font-medium text-slate-900">{u.full_name || "—"}</div>
                    <div className="truncate text-xs text-slate-500">{u.email ?? "no email"}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={
                        u.role === "admin"
                          ? "rounded-full bg-olive/15 px-2 py-0.5 text-xs font-medium text-olive"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">{fmtDate(u.created_at)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{nf.format(u.resume_count)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{nf.format(u.downloads)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-700">{nf.format(u.selections)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">{fmtDate(u.last_activity)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-charcoal/50">
        Activity counts only. Resume content is private and not visible to admins.
      </p>
    </div>
  );
}
