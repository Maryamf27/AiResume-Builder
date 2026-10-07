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

/** Prefer valid JSONB code, with legacy columns as a safe compatibility fallback. */
export function resolveTemplateSource(template: TemplateInput): Omit<TemplateSource, "code"> {
  const candidate: unknown = template.code;
  if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
    const code = candidate as Record<string, unknown>;
    if (typeof code.html === "string" && code.html.trim() && typeof code.css === "string") {
      return { html: code.html, css: code.css };
    }
  }
  return {
    html: typeof template.html === "string" ? template.html : "",
    css: typeof template.css === "string" ? template.css : "",
  };
}
