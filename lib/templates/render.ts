import Mustache from "mustache";
import type { ResumeData } from "@/types/resume";
import { buildTemplateView } from "@/lib/templates/view-model";
import { sampleResume } from "@/lib/templates/sample-data";
import { resolveTemplateSource, type TemplateInput } from "@/lib/templates/source";
export { resolveTemplateSource } from "@/lib/templates/source";
export type { TemplateSource } from "@/lib/templates/source";

export const A4_WIDTH_PX = 794; // 210mm at 96dpi
export const A4_HEIGHT_PX = 1123; // 297mm at 96dpi

/**
 * Unescaped output ({{{x}}}, {{&x}}) and custom delimiters ({{=<% %>=}}) would
 * let resume text inject markup, so templates may not use them. Returns a
 * message describing the first problem, or null when the syntax is fine.
 */
export function findUnsafeSyntax(html: string): string | null {
  if (/\{\{\{/.test(html) || /\{\{\s*&/.test(html)) {
    return "Unescaped tags ({{{ }}} and {{& }}) are not allowed. Use {{name}}.";
  }
  if (/\{\{\s*=/.test(html)) return "Custom delimiters ({{= =}}) are not allowed.";
  if (/\{\{\s*>/.test(html)) return "Partials ({{> name}}) are not supported.";
  return null;
}

/** Throws a readable error when the template markup is not valid Mustache. */
export function checkTemplateSyntax(html: string): string | null {
  const unsafe = findUnsafeSyntax(html);
  if (unsafe) return unsafe;
  try {
    Mustache.parse(html);
  } catch (err) {
    return err instanceof Error ? err.message : "The template has a syntax error.";
  }
  return null;
}

/** Reject misspelled or unsupported placeholders before a template is saved. */
export function checkTemplateVariables(html: string): string | null {
  const view = buildTemplateView(sampleResume);
  const allowed = new Set<string>();
  const collect = (value: unknown, prefix = "") => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      allowed.add(key);
      allowed.add(path);
      if (Array.isArray(child)) child.forEach((item) => collect(item, path));
      else collect(child, path);
    }
  };
  collect(view);
  const tags = [...html.matchAll(/\{\{\s*([#^/]?)\s*([a-zA-Z0-9_.]+)\s*\}\}/g)];
  for (const [, , variable] of tags) {
    if (variable !== "." && !allowed.has(variable)) {
      return `This design includes information the resume builder does not provide ("${variable}"). Click Copy Prompt and ask the AI to use only the listed resume information.`;
    }
  }
  if ("fullName" in view && !tags.some(([, , variable]) => variable === "fullName")) {
    return "The candidate's name is missing. Click Copy Prompt and ask the AI to include the resume owner's name.";
  }

  const requiredSections = [
    { field: "summary", label: "professional summary", repeated: false },
    { field: "experience", label: "work experience", repeated: true },
    { field: "education", label: "education", repeated: true },
    { field: "skills", label: "skills", repeated: true },
  ];
  for (const section of requiredSections) {
    if (!(section.field in view)) continue;
    const included = tags.some(([, marker, variable]) =>
      variable === section.field && (!section.repeated || marker === "#"),
    );
    if (!included) {
      return `The ${section.label} section is missing. Click Copy Prompt and ask the AI to include it using the provided resume information.`;
    }
  }
  return null;
}

export function checkTemplateCss(css: string): string | null {
  if (/@import/i.test(css)) return "CSS @import is not allowed.";
  if (/expression\s*\(|behavior\s*:|-moz-binding|javascript:/i.test(css)) return "The CSS contains a disallowed construct.";
  if (/<\/?style/i.test(css)) return "Remove any <style> tags; paste only the CSS rules.";
  if (/url\(\s*(?!["']?\s*data:)/i.test(css)) return "CSS url() may only point to embedded data: images.";
  return null;
}

// Resume text is escaped by Mustache; this also covers quotes used in attributes.
const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};
const escapeHtml = (s: string) => String(s).replace(/[&<>"'`=/]/g, (c) => ESCAPES[c]);

/**
 * Fills a template with resume data and returns a complete, self-contained
 * HTML document. The document carries a strict Content-Security-Policy (no
 * scripts, no network, images/fonts only from data: URIs) and is meant to be
 * shown in a sandboxed iframe or printed to PDF.
 */
export function renderTemplateDocument(template: TemplateInput, data: ResumeData): string {
  const source = resolveTemplateSource(template);
  const unsafe = findUnsafeSyntax(source.html);
  if (unsafe) throw new Error(unsafe);

  const body = Mustache.render(source.html, buildTemplateView(data), undefined, {
    escape: escapeHtml,
  });

  // A stray "</style" in the CSS would end the style block early.
  const css = source.css.replace(/<\/style/gi, "");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'; base-uri 'none'">
<style>
@page { size: A4; margin: 0; }
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body { width: ${A4_WIDTH_PX}px; min-height: ${A4_HEIGHT_PX}px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
<style>
${css}
</style>
</head>
<body>
${body}
</body>
</html>`;
}
