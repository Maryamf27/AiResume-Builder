import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/require-admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-cream-dark/60 bg-cream-light">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-6">
            <span className="font-serif text-base text-charcoal">Admin</span>
            <nav className="flex items-center gap-4 text-sm text-charcoal/70">
              <Link href="/admin/templates" className="hover:text-charcoal">
                Templates
              </Link>
            </nav>
          </div>
          <Link href="/dashboard" className="text-sm text-charcoal/70 hover:text-charcoal">
            Back to app
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">{children}</div>
    </div>
  );
}
