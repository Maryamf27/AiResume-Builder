import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outline-olive"
  | "ghost"
  | "ghost-destructive"
  | "destructive";

type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-6 text-base",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-olive text-cream hover:bg-olive-dark",
  secondary: "bg-cream-light text-charcoal hover:bg-cream-dark",
  outline:
    "border border-charcoal/15 bg-transparent text-charcoal hover:bg-cream-light",
  // Outlined at rest, fills olive green on hover (used by Download buttons).
  "outline-olive":
    "border border-charcoal/15 bg-transparent text-charcoal hover:border-olive hover:bg-olive hover:text-cream",
  // cream-light hover was invisible on cream-light cards; cream-dark shows on both.
  ghost: "bg-transparent text-charcoal hover:bg-cream-dark/60",
  "ghost-destructive":
    "bg-transparent text-destructive hover:bg-destructive/10",
  destructive: "bg-destructive text-cream hover:bg-destructive/90",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(base, sizes[size], variants[variant], className);
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClassName({ variant, size, className })}
        {...props}
      />
    );
  }
);

export default Button;
export { Button, type ButtonVariant as ButtonVariant, type ButtonSize as ButtonSize };
