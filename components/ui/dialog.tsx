"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Extra classes for the panel, e.g. widening it. */
  className?: string;
}

/**
 * A small, accessible modal consistent with the site's design system.
 * Closes on Escape and on backdrop click; traps focus loosely by focusing
 * the panel on open.
 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Callers usually pass an inline onClose, which changes identity on every
  // render. Keeping it in a ref means the effect below runs only when the
  // dialog opens or closes. Otherwise it re-ran on each keystroke and its
  // panel.focus() stole focus from any input inside the dialog.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    // Focus the panel only if nothing inside it (e.g. an autoFocus input) already has focus.
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) panel.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-charcoal/40"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative w-full rounded-lg border border-cream-dark bg-cream-light p-6 shadow-lg outline-none",
          // Default width, unless the caller sets its own max-w-* (there is no class merging).
          !className?.includes("max-w-") && "max-w-md",
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded p-1 text-charcoal/50 transition-colors hover:text-charcoal"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <h2 className="font-serif text-xl text-charcoal">{title}</h2>
        {description && (
          <p className="mt-2 text-sm leading-6 text-charcoal/70">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
