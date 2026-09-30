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

export function printResumeDocument(doc: string): void {
  const win = window.open("", "_blank");
  if (!win) {
    throw new Error(
      "Your browser blocked the download window. Please allow pop-ups for this site and try again."
    );
  }
  win.document.open();
  win.document.write(doc);
  win.document.close();

  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      // The window may have been closed before printing; nothing to do.
    }
  };

  if (win.document.readyState === "complete") {
    setTimeout(triggerPrint, 150);
  } else {
    win.addEventListener("load", () => setTimeout(triggerPrint, 150));
    setTimeout(triggerPrint, 1500);
  }
}
