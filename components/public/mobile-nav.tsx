"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import IconButton from "@/components/ui/icon-button";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import { routes } from "@/lib/site";
import { NavTextLink, primaryNav } from "@/components/public/nav-links";
import type { PublicAuthInfo } from "@/lib/auth/session";

export default function MobileNav({ auth }: { auth: PublicAuthInfo }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <IconButton
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls={panelId}
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
      </IconButton>

      {open ? (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/30"
            aria-label="Close navigation menu"
            onClick={close}
          />
          <div
            id={panelId}
            className="absolute inset-y-0 right-0 flex w-[min(20rem,100%)] flex-col border-l border-cream-dark bg-cream px-5 py-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <p className="font-serif text-base text-charcoal">Menu</p>
              <IconButton
                ref={closeRef}
                aria-label="Close navigation menu"
                variant="ghost"
                size="sm"
                onClick={close}
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </IconButton>
            </div>
            <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1">
              {primaryNav.map((item) => (
                <NavTextLink
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="flex min-h-11 items-center px-2 text-base"
                >
                  {item.label}
                </NavTextLink>
              ))}
              {auth.authenticated ? (
                <>
                  <NavTextLink
                    href={auth.dashboardHref}
                    onClick={close}
                    className="flex min-h-11 items-center px-2 text-base"
                  >
                    {auth.isAdmin ? "Admin" : "Dashboard"}
                  </NavTextLink>
                  <form
                    action={routes.signOut}
                    method="post"
                    onSubmit={close}
                    className="contents"
                  >
                    <button
                      type="submit"
                      className="flex min-h-11 items-center justify-start gap-2 rounded-md px-2 text-left text-base text-charcoal/80 transition-colors hover:text-charcoal"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <NavTextLink
                  href={routes.signIn}
                  onClick={close}
                  className="flex min-h-11 items-center px-2 text-base"
                >
                  Sign In
                </NavTextLink>
              )}
              <ButtonLink
                href={routes.createResume}
                variant="primary"
                size="lg"
                className="mt-4 w-full"
                onClick={close}
              >
                {auth.authenticated ? "Open Builder" : "Create Resume"}
              </ButtonLink>
              {auth.authenticated ? (
                <form action={routes.signOut} method="post" className="mt-2">
                  <Button
                    type="submit"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={close}
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign out
                  </Button>
                </form>
              ) : null}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
