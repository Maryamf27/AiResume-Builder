import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { DashboardSessionProvider } from "@/components/dashboard/dashboard-session";
import { getSessionWithRole } from "@/lib/auth/session";

/**
 * The user dashboard is for regular users. Admins have their own Admin Panel.
 *
 * The shell lives here (not in each page) so the sidebar stays mounted between
 * pages, and identity is resolved once per full page load instead of on every
 * navigation. Pages load their data in the browser through TanStack Query; the
 * database's row-level security is what protects that data.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, fullName, createdAt } = await getSessionWithRole();
  if (isAdmin) redirect("/admin");

  const displayName = String(
    fullName ?? user.user_metadata?.full_name ?? user.user_metadata?.fullName ?? user.email?.split("@")[0] ?? "there"
  );

  return (
    <DashboardSessionProvider
      session={{
        userId: user.id,
        email: user.email ?? "",
        displayName,
        memberSince: createdAt ?? user.created_at ?? null,
      }}
    >
      <DashboardShell>{children}</DashboardShell>
    </DashboardSessionProvider>
  );
}
