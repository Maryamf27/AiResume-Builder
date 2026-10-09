"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminQueryOptions } from "@/lib/admin/queries";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquareText,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/admin/templates", label: "Templates", icon: LayoutTemplate, exact: false },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText, exact: false },
] as const;

export default function AdminShell({
  children,
  adminEmail,
}: {
  children: ReactNode;
  adminEmail: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const queryClient = useQueryClient();

  // Warm the cache for every admin page once the shell is up, so each sidebar
  // click shows data immediately instead of waiting on the network.
  useEffect(() => {
    const warm = () => {
      void queryClient.prefetchQuery(adminQueryOptions.overview);
      void queryClient.prefetchQuery(adminQueryOptions.users);
      void queryClient.prefetchQuery(adminQueryOptions.templates);
      void queryClient.prefetchQuery(adminQueryOptions.feedback);
    };
    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(warm, { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(warm, 300);
    return () => window.clearTimeout(timer);
  }, [queryClient]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    await createClient().auth.signOut();
    queryClient.clear();
    router.push("/");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-olive text-cream"
                : "text-charcoal/65 hover:bg-cream-dark/40 hover:text-charcoal"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={signingOut}
        className="mt-2 flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-charcoal/65 transition-colors hover:bg-cream-dark/40 hover:text-charcoal disabled:opacity-50"
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </nav>
  );

  const brand = (
    <Link href="/" className="flex min-w-0 items-center gap-2">
      <span className="truncate font-serif text-lg text-charcoal">{SITE_NAME}</span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-olive/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-olive">
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
        Admin
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-cream">
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-3 border-b border-cream-dark/60 bg-cream-light px-4 sm:px-5 lg:hidden">
        <div className="min-w-0 flex-1">{brand}</div>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="shrink-0 rounded-md p-2 text-charcoal transition-colors hover:bg-cream-dark/50"
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-cream-light px-5 py-4 lg:hidden">
          <div className="sticky top-0 mb-4 flex items-center justify-between border-b border-cream-dark/60 bg-cream-light py-2">
            {brand}
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="rounded-md p-2 text-charcoal transition-colors hover:bg-cream-dark/50"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {nav}
        </div>
      )}

      {/* Desktop sidebar: fixed to the viewport so it never moves with the page. */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto border-r border-cream-dark/60 bg-cream-light px-4 py-6 lg:flex">
        <div className="mb-8 px-3">{brand}</div>
        {nav}
        {adminEmail && (
          <p className="mt-auto truncate px-3 pt-6 text-xs text-charcoal/50" title={adminEmail}>
            Signed in as {adminEmail}
          </p>
        )}
      </aside>

      <main className="min-h-screen min-w-0 px-4 pb-24 pt-6 sm:px-6 sm:pb-24 sm:pt-8 lg:ml-60 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
