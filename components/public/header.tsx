import ButtonLink from "@/components/ui/button-link";
import MobileNav from "@/components/public/mobile-nav";
import SiteLogo from "@/components/public/site-logo";
import { NavTextLink, primaryNav } from "@/components/public/nav-links";
import { containerClass, routes } from "@/lib/site";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-dark/60 bg-cream/80 backdrop-blur-sm">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-cream focus:px-3 focus:py-2 focus:text-sm focus:text-charcoal focus:ring-2 focus:ring-olive-light"
      >
        Skip to main content
      </a>
      <div className={`${containerClass} flex h-16 items-center justify-between`}>
        <SiteLogo />
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {primaryNav.map((item) => (
            <NavTextLink key={item.href} href={item.href}>
              {item.label}
            </NavTextLink>
          ))}
          <NavTextLink href={routes.signIn}>Sign In</NavTextLink>
          <ButtonLink href={routes.createResume} variant="primary" size="sm">
            Create Resume
          </ButtonLink>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
