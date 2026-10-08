import type { TemplateCode } from "@/types/supabase";

export interface TemplateSource {
  html: string;
  css: string;
  code?: TemplateCode | null;
}

export interface TemplateInput {
  html?: unknown;
  css?: unknown;
  code?: unknown;
}

/** Existing html/css columns are authoritative; code stores their structured copy. */
export function resolveTemplateSource(template: TemplateInput): Omit<TemplateSource, "code"> {
  return {
    html: typeof template.html === "string" ? template.html : "",
    css: typeof template.css === "string" ? template.css : "",
  };
}
