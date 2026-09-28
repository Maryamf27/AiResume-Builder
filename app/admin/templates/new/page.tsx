import type { Metadata } from "next";
import TemplateForm from "@/components/admin/template-form";
import { createTemplateAction } from "../actions";

export const metadata: Metadata = { title: "New template · Admin" };

export default function NewTemplatePage() {
  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-charcoal">New template</h1>
      <TemplateForm action={createTemplateAction} submitLabel="Create template" />
    </div>
  );
}
