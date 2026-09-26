import type { ReactNode } from "react";
import Link from "next/link";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

export const primaryNav = [
  { href: routes.templates, label: "Templates" },
  { href: routes.features, label: "Features" },
  { href: routes.about, label: "About" },
] as const;

export function NavTextLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm text-charcoal/80 transition-colors hover:text-charcoal",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        className
      )}
    >
      {children}
    </Link>
  );
}
