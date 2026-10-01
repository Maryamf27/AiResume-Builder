import type { ResumeData } from "@/types/resume";
import type { PublishedTemplate } from "@/lib/templates/types";
import type { TemplateSource } from "@/lib/templates/render";
import { renderTemplateDocument } from "@/lib/templates/render";
import { STARTER_CSS, STARTER_HTML } from "@/lib/templates/starter-template";


export function resumePdfFilename(title: string, data: ResumeData): string {
  const name = [data.personal.firstName, data.personal.lastName]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
  const source = name || title || "resume";
  const slug = source
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = slug || "resume";
  return `${base}${name ? "-resume" : ""}.pdf`;
}


export function buildResumeDocument(
  template: PublishedTemplate | null,
  data: ResumeData,
  filename: string
): string {
  const source: TemplateSource = template
    ? { html: template.html, css: template.css }
    : { html: STARTER_HTML, css: STARTER_CSS };
  const doc = renderTemplateDocument(source, data);
  const title = filename.replace(/\.pdf$/i, "").replace(/</g, "");
  return doc.replace(
    '<meta charset="utf-8">',
    `<meta charset="utf-8">\n<title>${title}</title>`
  );
}

export async function downloadResumePdf(doc: string, filename: string): Promise<void> {
  const response = await fetch("/api/resume-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document: doc, filename }),
  });

  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const message =
      result && typeof result === "object" && "error" in result && typeof result.error === "string"
        ? result.error
        : "Couldn't generate the PDF. Please try again.";
    throw new Error(message);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
