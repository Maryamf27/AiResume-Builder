import type { ResumeData } from "@/types/resume";
import type { PublishedTemplate } from "@/lib/templates/types";
import type { TemplateSource } from "@/lib/templates/render";
import { renderTemplateDocument } from "@/lib/templates/render";
import { STARTER_CSS, STARTER_HTML } from "@/lib/templates/starter-template";


export function resumePdfFilename(title: string): string {
  const source = title.trim() || "My Resume";
  const slug = source
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
  return `${slug || "my-resume"}.pdf`;
}


export function buildResumeDocument(
  template: PublishedTemplate | null,
  data: ResumeData,
  filename: string
): string {
  const source: TemplateSource = template
    ? template
    : { html: STARTER_HTML, css: STARTER_CSS };
  const doc = renderTemplateDocument(source, data);
  const title = filename.replace(/\.pdf$/i, "").replace(/</g, "");
  return doc.replace(
    '<meta charset="utf-8">',
    `<meta charset="utf-8">\n<title>${title}</title>`
  );
}

type SaveFileHandle = {
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type SaveFilePickerOptions = {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
};

export async function downloadResumePdf(
  doc: string,
  filename: string,
  promptForSaveLocation = false
): Promise<void> {
  const pickerWindow = window as Window & {
    showSaveFilePicker?: (options: SaveFilePickerOptions) => Promise<SaveFileHandle>;
  };
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

  if (!(response.headers.get("content-type") ?? "").toLowerCase().startsWith("application/pdf")) {
    throw new Error("PDF generation returned an invalid response. Please try again.");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength < 5 || new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-") {
    throw new Error("PDF generation returned an invalid file. Please try again.");
  }
  const pdf = new Blob([bytes], { type: "application/pdf" });

  const fileHandle = promptForSaveLocation && pickerWindow.showSaveFilePicker
    ? await pickerWindow.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: "PDF document", accept: { "application/pdf": [".pdf"] } }],
      })
    : null;

  if (fileHandle) {
    const writable = await fileHandle.createWritable();
    await writable.write(pdf);
    await writable.close();
    return;
  }

  const objectUrl = URL.createObjectURL(pdf);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
