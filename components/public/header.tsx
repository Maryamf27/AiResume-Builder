import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import ButtonLink from "@/components/ui/button-link";
import Button from "@/components/ui/button";
import MobileNav from "@/components/public/mobile-nav";
import SiteLogo from "@/components/public/site-logo";
import { NavTextLink, primaryNav } from "@/components/public/nav-links";
import { containerClass, routes } from "@/lib/site";
import type { PublicAuthInfo } from "@/lib/auth/session";

function SignOutButton({
  variant = "ghost",
  size = "sm",
  className,
}: {
  variant?: "primary" | "secondary" | "outline" | "outline-olive" | "ghost" | "ghost-destructive" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <form action={routes.signOut} method="post" className="contents">
      <Button type="submit" variant={variant} size={size} className={className}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </Button>
    </form>
  );
}

export default function PublicHeader({ auth }: { auth: PublicAuthInfo }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cream-dark/60 bg-cream/80 backdrop-blur-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-cream focus:px-3 focus:py-2 focus:text-sm focus:text-charcoal focus:ring-2 focus:ring-olive-light"
      >
        Skip to main content
      </a>
      <div className={`${containerClass} flex h-16 w-full items-center justify-between`}>
        <SiteLogo />
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {primaryNav.map((item) => (
            <NavTextLink key={item.href} href={item.href}>
              {item.label}
            </NavTextLink>
          ))}
          {auth.authenticated ? (
            <>
              <NavTextLink href={auth.dashboardHref}>
                {auth.isAdmin ? "Admin" : "Dashboard"}
              </NavTextLink>
              <SignOutButton />
            </>
          ) : (
            <NavTextLink href={routes.signIn}>Sign In</NavTextLink>
          )}
          <ButtonLink href={routes.createResume} variant="primary" size="sm">
            {auth.authenticated ? "Open Builder" : "Create Resume"}
          </ButtonLink>
        </nav>
        <MobileNav auth={auth} />
      </div>
    </header>
  );
}
