import Link from "next/link";
import { FileText } from "lucide-react";
import { SITE_NAME, routes } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function SiteLogo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={routes.home}
      className={cn(
        "flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center rounded-md bg-olive text-cream",
          compact ? "h-7 w-7" : "h-8 w-8"
        )}
      >
        <FileText
          className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
          strokeWidth={2}
        />
      </span>
      <span
        className={cn(
          "font-serif tracking-tight text-charcoal",
          compact ? "text-base" : "text-lg"
        )}
      >
        {SITE_NAME}
      </span>
    </Link>
  );
}
