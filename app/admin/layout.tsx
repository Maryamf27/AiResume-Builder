import type { Metadata } from "next";
import AdminShell from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/require-admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return <AdminShell adminEmail={user.email ?? null}>{children}</AdminShell>;
}
