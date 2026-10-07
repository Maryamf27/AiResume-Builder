"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { checkTemplateCss, checkTemplateSyntax, checkTemplateVariables, renderTemplateDocument } from "@/lib/templates/render";
import { sampleResume } from "@/lib/templates/sample-data";
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
  const prompt = String(formData.get("prompt") ?? "").trim();
  const rawHtml = String(formData.get("html") ?? "");
  const css = String(formData.get("css") ?? "");
  if (prompt.length < 8 || prompt.length > 4000) return { error: "Describe the design in 8 to 4,000 characters." };
  if (!rawHtml.trim()) return { error: "Paste the generated template HTML." };
  if (rawHtml.length > MAX_HTML_BYTES) return { error: "Template HTML is too large (200 KB max)." };
  if (css.length > MAX_CSS_BYTES) return { error: "Template CSS is too large (100 KB max)." };
  const syntaxProblem = checkTemplateSyntax(rawHtml);
  if (syntaxProblem) return { error: `Template syntax: ${syntaxProblem}` };
  const variableProblem = checkTemplateVariables(rawHtml);
  if (variableProblem) return { error: variableProblem };
  const cssProblem = findUnsafeCss(css) ?? checkTemplateCss(css);
  if (cssProblem) return { error: cssProblem };
  const html = sanitizeTemplateHtml(rawHtml);
  const inlineProblem = findUnsafeInlineStyle(html);
  if (inlineProblem) return { error: inlineProblem };
  const cleanedSyntax = checkTemplateSyntax(html);
  if (cleanedSyntax) return { error: `Cleaning the HTML broke the template (${cleanedSyntax}). Check tags are properly nested.` };
  const cleanedVariables = checkTemplateVariables(html);
  if (cleanedVariables) return { error: cleanedVariables };
  try {
    renderTemplateDocument({ html, css }, sampleResume);
  } catch (error) {
    return { error: `Template could not be rendered: ${error instanceof Error ? error.message : "unknown error"}` };
  }

  const firstSentence = prompt.split(/[.!?\n]/)[0]?.trim() || prompt;
  const cleanedName = firstSentence
    .replace(/^(please\s+)?(create|design|make|build|generate)\s+(me\s+)?(a|an|the)?\s*/i, "")
    .replace(/\b(resume|cv|template|layout|design)\b/gi, " ")
    .replace(/[^a-z0-9 ]/gi, " ").replace(/\s+/g, " ").trim();
  const name = (cleanedName.split(" ").slice(0, 5).join(" ") || "Custom Resume Template")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 80);
  const slugBase = slugify(name) || "custom-resume-template";
  const category = /ats|applicant tracking|screening/i.test(prompt) ? "ATS-friendly"
    : /minimal|simple|clean/i.test(prompt) ? "Minimal"
    : /creative|bold|colorful/i.test(prompt) ? "Creative"
    : /academic|research/i.test(prompt) ? "Academic"
    : /two[- ]column|sidebar/i.test(prompt) ? "Two-column"
    : /modern|contemporary/i.test(prompt) ? "Modern" : "Professional";
  const { data: existing } = await supabase.from("templates").select("slug,sort_order");
  const occupied = new Set((existing ?? []).map((row) => row.slug));
  let slug = slugBase;
  let suffix = 2;
  while (occupied.has(slug)) slug = `${slugBase}-${suffix++}`;
  const sortOrder = Math.max(0, ...(existing ?? []).map((row) => row.sort_order)) + 10;
  const description = firstSentence.slice(0, 240) || prompt.slice(0, 240);
  const code = { html, css };
  const { error } = await supabase.from("templates").insert({
    name, slug, description, category, sort_order: sortOrder,
    html, css, code, prompt, created_by: user.id,
  });
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
