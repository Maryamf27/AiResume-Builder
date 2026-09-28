import Mustache from "mustache";
import type { ResumeData } from "@/types/resume";
import { buildTemplateView } from "@/lib/templates/view-model";

export interface TemplateSource {
  html: string;
  css: string;
}

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
export function renderTemplateDocument(template: TemplateSource, data: ResumeData): string {
  const unsafe = findUnsafeSyntax(template.html);
  if (unsafe) throw new Error(unsafe);

  const body = Mustache.render(template.html, buildTemplateView(data), undefined, {
    escape: escapeHtml,
  });

  // A stray "</style" in the CSS would end the style block early.
  const css = template.css.replace(/<\/style/gi, "");

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
