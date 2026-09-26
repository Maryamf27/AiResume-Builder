import ButtonLink from "@/components/ui/button-link";
import { containerClass, routes } from "@/lib/site";

export default function FinalCta({
  id,
  title,
  description,
}: {
  id?: string;
  title: string;
  description: string;
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
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={routes.createResume} variant="primary" size="lg">
              Create Resume
            </ButtonLink>
            <ButtonLink href={routes.templates} variant="outline" size="lg">
              Explore Templates
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
