"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import IconButton from "@/components/ui/icon-button";

export default function EntryCard({
  title,
  onRemove,
  removeLabel = "Remove entry",
  children,
}: {
  title: string;
  onRemove: () => void;
  removeLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-cream-dark bg-cream-light p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-charcoal/70">{title}</p>
        <IconButton
          type="button"
          size="sm"
          aria-label={removeLabel}
          onClick={onRemove}
          className="text-charcoal/40 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </IconButton>
      </div>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </div>
  );
}
