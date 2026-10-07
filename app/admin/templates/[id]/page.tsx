import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TemplateForm from "@/components/admin/template-form";
import { requireAdmin } from "@/lib/admin/require-admin";
import { updateTemplateAction } from "@/app/admin/templates/actions";
import { resolveTemplateSource } from "@/lib/templates/render";

export const metadata: Metadata = { title: "Edit template · Admin" };

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  const { data: t } = await supabase.from("templates").select("*").eq("id", id).maybeSingle();
  if (!t) notFound();
  const source = resolveTemplateSource(t);

  return (
    <div>
      <h1 className="mb-6 font-serif text-3xl text-charcoal">Edit “{t.name}”</h1>
      <TemplateForm
        action={updateTemplateAction.bind(null, t.id)}
        submitLabel="Save changes"
        initial={{
          name: t.name,
          slug: t.slug,
          description: t.description ?? "",
          category: t.category ?? "",
          sortOrder: t.sort_order,
          isPublished: t.is_published,
          html: source.html,
          css: source.css,
        }}
      />
    </div>
  );
}
