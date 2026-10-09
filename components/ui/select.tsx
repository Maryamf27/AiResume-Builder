"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label?: string;
}

interface SelectProps {
  options: readonly (string | SelectOption)[];
  /** Controlled value. Omit to let the component manage its own state. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** When set, a hidden input is rendered so the value submits with a <form>. */
  name?: string;
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
  /** Extra classes for the trigger button. */
  triggerClassName?: string;
  /** Capitalise labels (handy for lowercase enum values such as "new"). */
  capitalize?: boolean;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "below" | "above";
}

const MENU_GAP = 6;
const VIEWPORT_MARGIN = 8;
const MAX_MENU_HEIGHT = 288;

function normalise(options: SelectProps["options"]): Required<SelectOption>[] {
  return options.map((option) =>
    typeof option === "string"
      ? { value: option, label: option }
      : { value: option.value, label: option.label ?? option.value }
  );
}

/**
 * App-themed dropdown. The native <select> popup can't be styled (it renders
 * with OS colours), so this is a small listbox that follows the cream/olive
 * palette. The menu is portalled to <body> and positioned with fixed
 * coordinates so it is never clipped by `overflow-hidden` tables or cards, and
 * it flips upwards when there is no room below (important on phones).
 */
export default function Select({
  options,
  value,
  defaultValue,
  onChange,
  name,
  id,
  disabled,
  "aria-label": ariaLabel,
  className,
  triggerClassName,
  capitalize,
}: SelectProps) {
  const items = useMemo(() => normalise(options), [options]);
  const autoId = useId();
  const triggerId = id ?? `select-${autoId}`;
  const listId = `${triggerId}-list`;

  const isControlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? items[0]?.value ?? "");
  const current = isControlled ? value : inner;
  const selectedIndex = Math.max(
    0,
    items.findIndex((item) => item.value === current)
  );

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });

  const selected = items[selectedIndex];

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    const spaceBelow = viewportH - rect.bottom - MENU_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - MENU_GAP - VIEWPORT_MARGIN;
    const wanted = Math.min(MAX_MENU_HEIGHT, items.length * 40 + 8);
    const placement = spaceBelow >= wanted || spaceBelow >= spaceAbove ? "below" : "above";
    const available = placement === "below" ? spaceBelow : spaceAbove;
    const maxHeight = Math.max(120, Math.min(MAX_MENU_HEIGHT, available));
    const width = Math.max(rect.width, 140);
    const left = Math.min(Math.max(VIEWPORT_MARGIN, rect.left), viewportW - width - VIEWPORT_MARGIN);
    setPosition({
      top: placement === "below" ? rect.bottom + MENU_GAP : rect.top - MENU_GAP,
      left,
      width,
      maxHeight,
      placement,
    });
  }, [items.length]);

  const openMenu = useCallback(
    (index = selectedIndex) => {
      if (disabled) return;
      setActiveIndex(index);
      place();
      setOpen(true);
    },
    [disabled, place, selectedIndex]
  );

  const closeMenu = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }, []);

  const commit = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) return;
      if (!isControlled) setInner(item.value);
      onChange?.(item.value);
      closeMenu();
    },
    [closeMenu, isControlled, items, onChange]
  );

  // Keep the menu glued to the trigger while open.
  useLayoutEffect(() => {
    if (!open) return;
    place();
    const onMove = () => place();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, place]);

  // Close on outside press.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Focus the listbox when it opens and keep the active option visible.
  useEffect(() => {
    if (open) menuRef.current?.focus({ preventScroll: true });
  }, [open, position?.placement]);

  useEffect(() => {
    if (!open) return;
    menuRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, position]);

  useEffect(() => {
    const state = typeahead.current;
    return () => window.clearTimeout(state.timer);
  }, []);

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(selectedIndex);
    }
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const last = items.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((i) => Math.min(last, i + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        closeMenu();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const state = typeahead.current;
          window.clearTimeout(state.timer);
          state.text += event.key.toLowerCase();
          state.timer = window.setTimeout(() => (state.text = ""), 600);
          const hit = items.findIndex((item) => item.label.toLowerCase().startsWith(state.text));
          if (hit >= 0) setActiveIndex(hit);
        }
    }
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      {name && <input type="hidden" name={name} value={current} />}
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? closeMenu(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-cream-dark bg-cream-light pl-3 pr-2.5 text-left text-sm text-charcoal shadow-sm transition-colors",
          "hover:border-olive/50 focus-visible:border-olive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "border-olive ring-2 ring-olive-light/30",
          triggerClassName
        )}
      >
        <span className={cn("truncate", capitalize && "capitalize")}>{selected?.label ?? ""}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-olive transition-transform duration-150", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open &&
        position &&
        createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={ariaLabel}
            aria-activedescendant={`${listId}-${activeIndex}`}
            onKeyDown={onMenuKeyDown}
            style={{
              position: "fixed",
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
              ...(position.placement === "below"
                ? { top: position.top }
                : { bottom: window.innerHeight - position.top }),
            }}
            className="z-[100] overflow-y-auto overscroll-contain rounded-lg border border-cream-dark bg-cream-light p-1 shadow-lg shadow-charcoal/10 outline-none"
          >
            {items.map((item, index) => {
              const isSelected = index === selectedIndex;
              const isActive = index === activeIndex;
              return (
                <li
                  key={item.value}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={() => commit(index)}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-charcoal",
                    capitalize && "capitalize",
                    isActive && "bg-cream-dark/70",
                    isSelected && "font-medium text-olive-dark"
                  )}
                >
                  <span className="truncate">{item.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-olive" aria-hidden="true" />}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
}
