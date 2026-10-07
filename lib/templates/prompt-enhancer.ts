import { buildTemplateView } from "@/lib/templates/view-model";
import { sampleResume } from "@/lib/templates/sample-data";

type ViewValue = string | boolean | ViewValue[] | { [key: string]: ViewValue };

function describeCollections(value: ViewValue): string[] {
  const lines: string[] = [];
  for (const [name, child] of Object.entries(value)) {
    if (!Array.isArray(child) || !child.length) continue;
    const item = child[0];
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    lines.push(`- Repeatable collection \`${name}\`: open with {{#${name}}}, close with {{/${name}}}.`);
    for (const [field, nested] of Object.entries(item)) {
      if (typeof nested === "string") lines.push(`  - Current-item value: {{${field}}}`);
      else if (typeof nested === "boolean") lines.push(`  - Current-item optional flag: {{#${field}}}...{{/${field}}}`);
      else if (Array.isArray(nested)) {
        const nestedItem = nested[0];
        if (nestedItem && typeof nestedItem === "object" && !Array.isArray(nestedItem)) {
          const nestedFields = Object.keys(nestedItem).map((key) => `{{${key}}}`).join(", ");
          lines.push(`  - Nested repeatable collection: {{#${field}}}...{{/${field}}}, containing ${nestedFields}.`);
        }
      }
    }
  }
  return lines;
}

/** Builds external-AI instructions from the same view model used to render templates. */
export function enhanceTemplateDesignPrompt(designPrompt: string): string {
  const view = buildTemplateView(sampleResume) as ViewValue;
  const rootScalars = Object.entries(view)
    .filter(([, value]) => typeof value === "string")
    .map(([name]) => `{{${name}}}`);
  const rootFlags = Object.entries(view)
    .filter(([, value]) => typeof value === "boolean")
    .map(([name]) => `{{#${name}}}...{{/${name}}}`);
  const namePlaceholder = rootScalars.includes("{{fullName}}") ? "{{fullName}}" : null;
  const collections = describeCollections(view);
  const sectionNames = Object.keys(sampleResume)
    .filter((name) => name !== "templateId")
    .map((name) => `- ${name}`);

  return `Create a polished resume template. Follow the implementation requirements below exactly.\n\nDESIGN BRIEF\n${designPrompt.trim()}\n\nCRITICAL DATA RULES\n- Use the application's existing ResumeData Mustache values exactly. Never hardcode candidate names, contact details, employers, schools, skills, dates, sample resume text, or any other candidate-specific content. Every displayed value must come from a supported Mustache value. Static section headings and design labels are fine.\n${namePlaceholder ? `- The candidate's name MUST use ${namePlaceholder}; never substitute a made-up name or static sample name.` : "- Use the supported candidate identity values listed below; do not hardcode a candidate name."}\n- Never invent, rename, or assume variables. Use only the exact values and section blocks listed below.\n- Include the candidate identity, professional summary, work experience, education, and skills sections. Include the other supported sections whenever their resume data is available.\n- Preserve every repeated item and every description line. Do not truncate, duplicate, or assume a fixed number of entries.\n\nDESIGN AND CONTENT\n- Preserve the requested visual style while keeping the resume readable, professional, and ATS-friendly.\n- The existing ResumeData sections are:\n${sectionNames.join("\n")}\n- Let content flow naturally over as many printed pages as needed. Do not use fixed heights, clipping, hidden overflow, or hard-coded limits on repeated entries. Keep each repeated entry together across a page break when practical; allow long descriptions to wrap and continue.\n\nEXACT TEMPLATE DATA AVAILABLE FROM THE EXISTING RENDERER\n- Supported root text values: ${rootScalars.join(", ")}.\n- Supported root boolean flags for optional content: ${rootFlags.join(", ")}.\n${collections.join("\n")}\n- This list is generated from the same template view model used by the existing renderer. Collection item fields are available only inside their corresponding loop.\n\nMUSTACHE RULES\n- Use the existing Mustache syntax exactly: escaped values use {{value}}; positive sections use {{#section}}...{{/section}}; inverted sections use {{^section}}...{{/section}}. Close each section with the matching name.\n- Use the collection blocks above for repeated entries, including skills. Never assume a collection has a fixed number of items. Use the supported boolean flags to guard optional sections.\n- Never use triple braces, {{& value}}, custom delimiters, or partials.\n\nOUTPUT, RESPONSIVE DESIGN, AND SAFETY\n- Return exactly two sections, without Markdown fences: HTML followed by CSS.\n- HTML must be a body fragment only; do not include html, head, body, script, style, or link tags.\n- CSS must contain only CSS rules. No JavaScript, external dependencies, remote images, external fonts, imports, or network URLs.\n- Use semantic HTML and an ATS-readable document order. Avoid tables for layout.\n- Make the layout responsive on narrow screens and print/PDF-friendly on A4 with sensible margins, readable contrast, print styles, system font stacks, and wrapping for long text. Avoid fixed heights and page-wide clipping.\n\nUse this exact response structure:\nHTML:\n[body-fragment markup]\n\nCSS:\n[CSS rules]`;
}
