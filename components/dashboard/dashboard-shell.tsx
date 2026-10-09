"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  LayoutTemplate,
  BriefcaseBusiness,
  UserRound,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useDashboardSession } from "@/components/dashboard/dashboard-session";
import { resumeListQueryOptions } from "@/lib/resume/client-cache";
import { publishedTemplateCountQueryOptions, publishedTemplatesQueryOptions } from "@/lib/templates/client-cache";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/resumes", label: "My Resumes", icon: FileText },
  { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/dashboard/career-tools", label: "Career Tools", icon: BriefcaseBusiness },
  { href: "/dashboard/account", label: "Account", icon: UserRound },
] as const;

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const queryClient = useQueryClient();
  const { userId } = useDashboardSession();

  // Warm the cache once the shell is up so the first visit to each page is instant too.
  useEffect(() => {
    const warm = () => {
      void queryClient.prefetchQuery(resumeListQueryOptions(userId));
      void queryClient.prefetchQuery(publishedTemplateCountQueryOptions);
      void queryClient.prefetchQuery(publishedTemplatesQueryOptions);
    };
    const idle = window.requestIdleCallback;
    if (idle) {
      const handle = idle(warm, { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = window.setTimeout(warm, 300);
    return () => window.clearTimeout(timer);
  }, [queryClient, userId]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    queryClient.clear();
    router.push("/");
    router.refresh();
  }

  const nav = (collapsed = false) => (
    <nav className="flex flex-col gap-1" aria-label="Dashboard">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (label === "Career Tools" && pathname.startsWith("/dashboard/career-tools/"));
        return (
          <Link
            key={label}
            href={href}
            onClick={() => setMenuOpen(false)}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            className={cn(
              "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2" : "gap-2.5 px-3",
              active
                ? "bg-cream-dark/70 text-charcoal"
                : "text-charcoal/65 hover:bg-cream-dark/40 hover:text-charcoal"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!collapsed && label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={signingOut}
        title={collapsed ? "Sign out" : undefined}
        aria-label={collapsed ? "Sign out" : undefined}
        className={cn(
          "mt-2 flex items-center rounded-md py-2 text-left text-sm font-medium text-charcoal/65 transition-colors hover:bg-cream-dark/40 hover:text-charcoal disabled:opacity-50",
          collapsed ? "justify-center px-2" : "gap-2.5 px-3"
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
        {!collapsed && (signingOut ? "Signing out…" : "Sign out")}
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-cream">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-cream-dark/60 bg-cream-light px-5 lg:hidden">
        <Link href="/" className="font-serif text-lg text-charcoal">
          {SITE_NAME}
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="rounded-md p-2 text-charcoal transition-colors hover:bg-cream-dark/50"
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-b border-cream-dark/60 bg-cream-light px-5 py-4 lg:hidden">
          {nav()}
        </div>
      )}

      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-cream-dark/60 bg-cream-light py-6 transition-[width] duration-200 lg:flex",
            sidebarCollapsed ? "w-16 px-2" : "w-56 px-4"
          )}
        >
          <div className={cn("mb-8 flex items-center", sidebarCollapsed ? "justify-center" : "justify-between px-3")}>
            <Link href="/" aria-label={sidebarCollapsed ? SITE_NAME : undefined} title={sidebarCollapsed ? SITE_NAME : undefined}>
              {sidebarCollapsed ? (
                <span className="font-serif text-lg text-charcoal">{SITE_NAME.slice(0, 1)}</span>
              ) : (
                <span className="font-serif text-lg text-charcoal">{SITE_NAME}</span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="rounded-md p-2 text-charcoal/65 transition-colors hover:bg-cream-dark/50 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {nav(sidebarCollapsed)}
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:py-10">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
