import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "outline" | "outline-olive" | "ghost" | "danger";

const base =
  "inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light disabled:pointer-events-none disabled:opacity-50 sm:h-9 sm:w-9";

const tones: Record<Tone, string> = {
  primary: "bg-olive text-cream hover:bg-olive-dark",
  outline: "border border-charcoal/15 text-charcoal hover:bg-cream-dark/60",
  "outline-olive":
    "border border-charcoal/15 text-charcoal hover:border-olive hover:bg-olive hover:text-cream",
  ghost: "text-charcoal hover:bg-cream-dark/60",
  danger: "text-destructive hover:bg-destructive/10",
};


export default function IconAction({
  label,
  tone = "ghost",
  href,
  onClick,
  disabled,
  children,
}: {
  label: string;
  tone?: Tone;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const className = cn(base, tones[tone]);
  return (
    <span className="group relative inline-flex">
      {href ? (
        <Link href={href} aria-label={label} className={className}>
          {children}
        </Link>
      ) : (
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
          className={className}
        >
          {children}
        </button>
      )}
      <span
        role="tooltip"
        aria-hidden="true"
        className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-charcoal px-2 py-1 text-xs font-medium text-cream opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
