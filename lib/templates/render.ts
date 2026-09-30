import Mustache from "mustache";
import type { ResumeData } from "@/types/resume";
import { buildTemplateView } from "@/lib/templates/view-model";

export interface TemplateSource {
  html: string;
  css: string;
}

export const A4_WIDTH_PX = 794; // 210mm at 96dpi
export const A4_HEIGHT_PX = 1123; // 297mm at 96dpi

export function findUnsafeSyntax(html: string): string | null {
  if (/\{\{\{/.test(html) || /\{\{\s*&/.test(html)) {
    return "Unescaped tags ({{{ }}} and {{& }}) are not allowed. Use {{name}}.";
  }
  if (/\{\{\s*=/.test(html)) return "Custom delimiters ({{= =}}) are not allowed.";
  if (/\{\{\s*>/.test(html)) return "Partials ({{> name}}) are not supported.";
  return null;
}

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

export function renderTemplateDocument(template: TemplateSource, data: ResumeData): string {
  const unsafe = findUnsafeSyntax(template.html);
  if (unsafe) throw new Error(unsafe);

  const body = Mustache.render(template.html, buildTemplateView(data), undefined, {
    escape: escapeHtml,
  });

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
