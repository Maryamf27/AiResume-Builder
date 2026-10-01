import { LogOut } from "lucide-react";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import { containerClass, routes } from "@/lib/site";
import type { PublicAuthInfo } from "@/lib/auth/session";

export default function FinalCta({
  id,
  title,
  description,
  auth = { authenticated: false },
}: {
  id?: string;
  title: string;
  description: string;
  auth?: PublicAuthInfo;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-20 border-t border-cream-dark/60 bg-cream"
      aria-labelledby={id ? `${id}-heading` : "final-cta-heading"}
    >
      <div className={`${containerClass} py-14 sm:py-16`}>
        <div className="flex flex-col items-center gap-4 text-center">
          <h2
            id={id ? `${id}-heading` : "final-cta-heading"}
            className="font-serif text-2xl tracking-tight text-charcoal sm:text-3xl"
          >
            {title}
          </h2>
          <p className="max-w-lg text-sm leading-6 text-charcoal/70 sm:text-base">
            {description}
          </p>
          {auth.authenticated ? (
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
              <ButtonLink href={auth.dashboardHref} variant="primary" size="lg">
                {auth.isAdmin ? "Go to Admin" : "Go to Dashboard"}
              </ButtonLink>
              <ButtonLink href={routes.createResume} variant="outline" size="lg">
                Open Builder
              </ButtonLink>
              <form action={routes.signOut} method="post">
                <Button variant="outline" size="lg">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={routes.createResume} variant="primary" size="lg">
                Create Resume
              </ButtonLink>
              <ButtonLink href={routes.templates} variant="outline" size="lg">
                Explore Templates
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
