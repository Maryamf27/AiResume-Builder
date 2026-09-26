import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
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
  ghost: "bg-transparent text-charcoal hover:bg-cream-light",
  destructive: "bg-destructive text-cream hover:bg-destructive/90",
};

export default function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    />
  );
}

export { Button, type ButtonVariant as ButtonVariant, type ButtonSize as ButtonSize };
