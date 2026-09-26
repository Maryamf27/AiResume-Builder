import { containerClass } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function PageIntro({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <header className={cn(containerClass, "pt-14 pb-10 sm:pt-20 sm:pb-14", className)}>
      {eyebrow ? (
        <p className="text-xs uppercase tracking-[0.2em] text-olive">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 max-w-3xl font-serif text-4xl font-medium tracking-tight text-charcoal sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-charcoal/70 sm:text-lg sm:leading-8">
        {description}
      </p>
    </header>
  );
}
