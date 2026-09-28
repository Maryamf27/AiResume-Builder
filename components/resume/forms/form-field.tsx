import type { ReactNode } from "react";

export default function FormField({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-charcoal">
        {label}
        {optional && <span className="ml-1 font-normal text-charcoal/45">(optional)</span>}
      </label>
      {children}
    </div>
  );
}