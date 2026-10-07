import type { Metadata } from "next";
import TemplateCreatorForm from "@/components/admin/template-creator-form";
import { createTemplateAction } from "../actions";

export const metadata: Metadata = { title: "New template · Admin" };

export default function NewTemplatePage() {
  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl text-charcoal">Create a template</h1>
      <p className="mb-6 max-w-2xl text-sm text-charcoal/65">Describe the design, copy the generation prompt for your external AI, then paste its HTML and CSS to preview and save.</p>
      <TemplateCreatorForm action={createTemplateAction} />
    </div>
  );
}
