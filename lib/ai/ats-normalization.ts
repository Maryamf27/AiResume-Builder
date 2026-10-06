const ATS_SEVERITY_ALIASES: Record<string, "critical" | "warning" | "suggestion"> = {
  critical: "critical",
  high: "critical",
  severe: "critical",
  major: "critical",
  warning: "warning",
  medium: "warning",
  moderate: "warning",
  suggestion: "suggestion",
  low: "suggestion",
  minor: "suggestion",
  info: "suggestion",
};

export function normalizeATSSeverity(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return ATS_SEVERITY_ALIASES[normalized] ?? value;
}
