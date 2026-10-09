"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import Button from "@/components/ui/button";
import { deleteTemplateAction, setPublishedAction } from "@/app/admin/templates/actions";
import { adminKeys, type AdminTemplatesData } from "@/lib/admin/queries";

export default function TemplateActionsMenu({
  templateId,
  templateName,
  isPublished,
}: {
  templateId: string;
  templateName: string;
  isPublished: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const queryClient = useQueryClient();

  /**
   * Updates the cached list straight away (so the row changes instantly), runs
   * the server action, then refreshes all admin data so counts elsewhere catch
   * up. If the action fails the refresh restores the true state.
   */
  async function mutate(
    action: (formData: FormData) => Promise<void>,
    update: (old: AdminTemplatesData) => AdminTemplatesData
  ) {
    setOpen(false);
    queryClient.setQueryData<AdminTemplatesData>(adminKeys.templates, (old) => (old ? update(old) : old));
    const formData = new FormData();
    formData.set("id", templateId);
    formData.set("publish", String(!isPublished));
    try {
      await action(formData);
    } finally {
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    }
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }

    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const menuWidth = 176;
    const menuHeight = 132;
    const top =
      rect.bottom + menuHeight + 8 <= window.innerHeight
        ? rect.bottom + 4
        : Math.max(8, rect.top - menuHeight - 4);
    const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));

    setPosition({ top, left });
    setOpen(true);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Actions for ${templateName}`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggleMenu}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-charcoal/65 transition-colors hover:bg-cream-dark/60 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            className="fixed z-100 w-44 rounded-md border border-cream-dark bg-cream-light p-1 shadow-lg"
            style={{ top: position.top, left: position.left }}
          >
            <Link
              href={`/admin/templates/${templateId}`}
              onClick={() => setOpen(false)}
              className="flex h-9 items-center rounded px-3 text-sm text-charcoal transition-colors hover:bg-cream-dark/60"
            >
              Edit template
            </Link>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="w-full justify-start"
              onClick={() =>
                void mutate(setPublishedAction, (old) => ({
                  ...old,
                  templates: old.templates.map((t) => (t.id === templateId ? { ...t, is_published: !isPublished } : t)),
                }))
              }
            >
              {isPublished ? "Unpublish" : "Publish"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost-destructive"
              className="w-full justify-start"
              onClick={() =>
                void mutate(deleteTemplateAction, (old) => ({
                  ...old,
                  templates: old.templates.filter((t) => t.id !== templateId),
                }))
              }
            >
              Delete template
            </Button>
          </div>,
          document.body
        )}
    </>
  );
}