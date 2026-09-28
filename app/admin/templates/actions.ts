"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { checkTemplateSyntax } from "@/lib/templates/render";
import {
  findUnsafeCss,
  findUnsafeInlineStyle,
  MAX_CSS_BYTES,
  MAX_HTML_BYTES,
  sanitizeTemplateHtml,
} from "@/lib/templates/sanitize";

export interface TemplateFormState {
  error: string | null;
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const sortOrder = Number.parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;
  const isPublished = formData.get("is_published") === "on";
  const rawHtml = String(formData.get("html") ?? "");
  const css = String(formData.get("css") ?? "");

  if (!name || name.length > 80) return { ok: false, error: "Name is required (max 80 characters)." } as const;
  if (!SLUG_RE.test(slug)) return { ok: false, error: "Slug may only contain lowercase letters, numbers and hyphens." } as const;
  if (!rawHtml.trim()) return { ok: false, error: "Template HTML is required." } as const;
  if (rawHtml.length > MAX_HTML_BYTES) return { ok: false, error: "Template HTML is too large (200 KB max)." } as const;
  if (css.length > MAX_CSS_BYTES) return { ok: false, error: "Template CSS is too large (100 KB max)." } as const;

  const syntaxProblem = checkTemplateSyntax(rawHtml);
  if (syntaxProblem) return { ok: false, error: `Template syntax: ${syntaxProblem}` } as const;

  const cssProblem = findUnsafeCss(css);
  if (cssProblem) return { ok: false, error: cssProblem } as const;

  const html = sanitizeTemplateHtml(rawHtml);
  const inlineProblem = findUnsafeInlineStyle(html);
  if (inlineProblem) return { ok: false, error: inlineProblem } as const;

  // Sanitizing can break Mustache structure in rare cases; re-check the result.
  const afterProblem = checkTemplateSyntax(html);
  if (afterProblem) {
    return { ok: false, error: `Cleaning the HTML broke the template (${afterProblem}). Check tags are properly nested.` } as const;
  }

  return {
    ok: true,
    values: {
      name,
      slug,
      description: description || null,
      category: category || null,
      sort_order: sortOrder,
      is_published: isPublished,
      html,
      css,
    },
  } as const;
}

function friendlyDbError(message: string, code?: string): string {
  if (code === "23505") return "A template with that slug already exists. Choose a different slug.";
  return `Could not save the template: ${message}`;
}

export async function createTemplateAction(
  _prev: TemplateFormState,
  formData: FormData,
): Promise<TemplateFormState> {
  const { supabase, user } = await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const { error } = await supabase
    .from("templates")
    .insert({ ...parsed.values, created_by: user.id });
  if (error) return { error: friendlyDbError(error.message, error.code) };

  revalidatePath("/admin/templates");
  redirect("/admin/templates");
}

export async function updateTemplateAction(
  id: string,
  _prev: TemplateFormState,
  formData: FormData,
): Promise<TemplateFormState> {
  const { supabase } = await requireAdmin();
  const parsed = parseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const { error } = await supabase.from("templates").update(parsed.values).eq("id", id);
  if (error) return { error: friendlyDbError(error.message, error.code) };

  revalidatePath("/admin/templates");
  redirect("/admin/templates");
}

export async function setPublishedAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const publish = formData.get("publish") === "true";
  if (!id) return;
  await supabase.from("templates").update({ is_published: publish }).eq("id", id);
  revalidatePath("/admin/templates");
}

export async function deleteTemplateAction(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await supabase.from("templates").delete().eq("id", id);
  revalidatePath("/admin/templates");
}
