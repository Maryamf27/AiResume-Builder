import * as React from "react";
import { cn } from "@/lib/utils";
import Button, { type ButtonProps } from "./button";

type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps
  extends Omit<ButtonProps, "children" | "size"> {
  size?: IconButtonSize;
  "aria-label": string;
  children: React.ReactNode;
}

const sizes: Record<IconButtonSize, string> = {
  sm: "h-9 w-9 p-0",
  md: "h-10 w-10 p-0",
  lg: "h-11 w-11 p-0",
};

export default function IconButton({
  className,
  size = "md",
  variant = "ghost",
  children,
  "aria-label": ariaLabel,
  ...props
}: IconButtonProps) {
  return (
    <Button
      variant={variant}
      aria-label={ariaLabel}
      className={cn("rounded-md", sizes[size], className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export { IconButton };
