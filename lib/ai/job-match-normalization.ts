const JOB_ARRAY_LIMITS: Record<string, number> = {
  experienceRequirements: 4,
  educationRequirements: 3,
  requiredSkills: 5,
  preferredSkills: 3,
  responsibilities: 4,
  requiredQualifications: 3,
  preferredQualifications: 2,
  keywords: 10,
  softSkills: 4,
  toolsAndTechnologies: 5,
  certifications: 3,
};

const MATCH_ARRAY_LIMITS: Record<string, number> = {
  matchedSkills: 5,
  missingSkills: 5,
  partialMatches: 3,
  matchedKeywords: 8,
  missingKeywords: 8,
  responsibilityMatches: 4,
  strengths: 2,
  gaps: 3,
  recommendations: 3,
};

function normalizeMatchBoolean(value: unknown): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

function copyAndLimitArrays(value: unknown, limits: Record<string, number>): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const result = { ...value } as Record<string, unknown>;
  for (const [key, limit] of Object.entries(limits)) {
    if (Array.isArray(result[key])) result[key] = result[key].slice(0, limit);
  }
  return result;
}

/** Keep only the highest-ranked items when a model exceeds the documented list limits. */
export function normalizeJobAnalysisPayload(value: unknown): unknown {
  return copyAndLimitArrays(value, JOB_ARRAY_LIMITS);
}

/** Normalize match output before the strict schema validates it. */
export function normalizeMatchAnalysisPayload(value: unknown, operation = "Job Match"): unknown {
  const normalized = copyAndLimitArrays(value, MATCH_ARRAY_LIMITS);
  if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) return normalized;
  const match = normalized as Record<string, unknown>;
  // Status is application-derived from overallScore, so model-provided variants are discarded.
  delete match.status;
  if (Array.isArray(match.responsibilityMatches)) {
    let normalizedTrueCount = 0;
    let normalizedFalseCount = 0;
    match.responsibilityMatches = match.responsibilityMatches.map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return item;
      const responsibilityMatch = { ...item } as Record<string, unknown>;
      const originalValue = responsibilityMatch.matched;
      responsibilityMatch.matched = normalizeMatchBoolean(originalValue);
      if (originalValue === "true") normalizedTrueCount += 1;
      if (originalValue === "false") normalizedFalseCount += 1;
      return responsibilityMatch;
    });
    if (normalizedTrueCount || normalizedFalseCount) {
      console.warn("AI_OUTPUT_NORMALIZED", {
        operation,
        field: "responsibilityMatches[].matched",
        normalizedTrueCount,
        normalizedFalseCount,
      });
    }
  }
  return match;
}

/** Normalize harmless formatting differences without weakening field validation. */
export function normalizeJobMatchPayload(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const result = { ...value } as Record<string, unknown>;
  // The UI derives status from overallScore; different models may add their own status.
  delete result.status;

  if (result.job && typeof result.job === "object" && !Array.isArray(result.job)) {
    const job = normalizeJobAnalysisPayload(result.job) as Record<string, unknown>;
    if (typeof job.summary !== "string" || !job.summary.trim()) {
      const title = typeof job.jobTitle === "string" ? job.jobTitle.trim() : "";
      job.summary = title
        ? `Requirements extracted for ${title}.`
        : "Requirements extracted from the supplied job description.";
    }
    result.job = job;
  }

  if (result.match && typeof result.match === "object" && !Array.isArray(result.match)) {
    result.match = normalizeMatchAnalysisPayload(result.match, "Job Analysis and Match");
  }

  return result;
}
