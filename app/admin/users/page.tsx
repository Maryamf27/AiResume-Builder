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

      <div className="mt-6 overflow-x-auto rounded-lg border border-cream-dark bg-cream-light">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-cream-dark text-xs uppercase tracking-wide text-charcoal/55">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Resumes</th>
              <th className="px-4 py-3 text-right font-medium">Downloads</th>
              <th className="px-4 py-3 text-right font-medium">Selections</th>
              <th className="px-4 py-3 font-medium">Last active</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-charcoal/55">
                  {query ? "No users match your search." : "No users yet."}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-cream-dark/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">{u.full_name || "—"}</div>
                    <div className="text-xs text-charcoal/50">{u.email ?? "no email"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.role === "admin"
                          ? "rounded-full bg-olive/15 px-2 py-0.5 text-xs font-medium text-olive"
                          : "rounded-full bg-cream-dark px-2 py-0.5 text-xs font-medium text-charcoal/65"
                      }
                    >
                      {u.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal/70">{fmtDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-charcoal/80">{nf.format(u.resume_count)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-charcoal/80">{nf.format(u.downloads)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-charcoal/80">{nf.format(u.selections)}</td>
                  <td className="px-4 py-3 text-charcoal/70">{fmtDate(u.last_activity)}</td>
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
