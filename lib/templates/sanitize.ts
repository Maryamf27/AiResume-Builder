import sanitizeHtml from "sanitize-html";

export const MAX_HTML_BYTES = 200_000;
export const MAX_CSS_BYTES = 100_000;

const TAGS = [
  "a", "abbr", "article", "aside", "b", "blockquote", "br", "div", "em", "footer", "h1", "h2",
  "h3", "h4", "h5", "h6", "header", "hr", "i", "img", "li", "main", "mark", "ol", "p", "section",
  "small", "span", "strong", "sub", "sup", "table", "tbody", "td", "tfoot", "th", "thead", "tr",
  "time", "u", "ul",
];

export function sanitizeTemplateHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: TAGS,
    allowedAttributes: {
      "*": ["class", "id", "style", "title", "lang"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["data"] },
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
  });
}

export function findUnsafeCss(css: string): string | null {
  if (/@import/i.test(css)) return "CSS @import is not allowed.";
  if (/expression\s*\(|behavior\s*:|-moz-binding|javascript:/i.test(css)) {
    return "The CSS contains a disallowed construct.";
  }
  if (/<\/?style/i.test(css)) return "Remove any <style> tags; paste only the CSS rules.";
  if (/url\(\s*(?!["']?\s*data:)/i.test(css)) {
    return "CSS url() may only point to embedded data: images (no external files or fonts).";
  }
  return null;
}

export function findUnsafeInlineStyle(html: string): string | null {
  if (/url\(\s*(?!["']?\s*data:)/i.test(html) || /expression\s*\(/i.test(html)) {
    return "Inline styles may not load external resources.";
  }
  return null;
}
