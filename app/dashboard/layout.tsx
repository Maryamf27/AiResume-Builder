import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSessionWithRole } from "@/lib/auth/session";

/** The user dashboard is for regular users. Admins have their own Admin Panel. */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = await getSessionWithRole();
  if (isAdmin) redirect("/admin");
  return children;
}
