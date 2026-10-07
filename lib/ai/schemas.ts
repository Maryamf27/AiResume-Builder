import { z } from "zod";
import { normalizeATSSeverity } from "@/lib/ai/ats-normalization";
import { normalizeJobAnalysisPayload, normalizeJobMatchPayload, normalizeMatchAnalysisPayload } from "@/lib/ai/job-match-normalization";
import type { ResumeData } from "@/types/resume";
import { sanitizeResumeData } from "@/lib/resume/validation";

const emptyPersonalInfo = {
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  github: "",
};

export const AIHealthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().min(1, "AI response message must not be empty."),
});

export const ATSCategorySchema = z.object({
  id: z.string().min(1, "Category id is required."),
  name: z.string().min(1, "Category name is required."),
  score: z.number().min(0).max(100),
  status: z.enum(["excellent", "good", "needs_improvement", "poor"]),
  summary: z.string().min(1, "Category summary is required."),
});

export const ATSStrengthSchema = z.object({
  title: z.string().min(1, "Strength title is required."),
  explanation: z.string().min(1, "Strength explanation is required."),
  category: z.string().min(1, "Strength category is required."),
});

export const ATSIssueSchema = z.object({
  id: z.string().min(1, "Issue id is required."),
  severity: z.preprocess(normalizeATSSeverity, z.enum(["critical", "warning", "suggestion"])),
  category: z.string().min(1, "Issue category is required."),
  title: z.string().min(1, "Issue title is required."),
  explanation: z.string().min(1, "Issue explanation is required."),
  recommendation: z.string().min(1, "Issue recommendation is required."),
});

export const ATSKeywordAnalysisSchema = z.object({
  detectedKeywords: z.array(z.string().min(1)).max(8).default([]),
  observations: z.array(z.string().min(1)).max(2).default([]),
});

export const ATSAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(1, "ATS summary is required."),
  categories: z.array(ATSCategorySchema).min(1).max(6),
  strengths: z.array(ATSStrengthSchema).max(3).default([]),
  issues: z.array(ATSIssueSchema).max(4).default([]),
  keywordAnalysis: ATSKeywordAnalysisSchema,
  nextSteps: z.array(z.string().min(1)).max(3).default([]),
});

export const JobRequirementSchema = z.object({
  requirement: z.string().min(1, "Requirement is required."),
  importance: z.enum(["required", "preferred", "unclear"]),
});

export const JobSkillSchema = z.object({
  skill: z.string().min(1, "Skill is required."),
  category: z.string().min(1, "Skill category is required."),
});

export const JobAnalysisSchema = z.preprocess(normalizeJobAnalysisPayload, z.object({
  jobTitle: z.string().nullable().default(null),
  companyName: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  employmentType: z.string().nullable().default(null),
  experienceRequirements: z.array(JobRequirementSchema).max(4).default([]),
  educationRequirements: z.array(JobRequirementSchema).max(3).default([]),
  requiredSkills: z.array(JobSkillSchema).max(5).default([]),
  preferredSkills: z.array(JobSkillSchema).max(3).default([]),
  responsibilities: z.array(z.string().min(1)).max(4).default([]),
  requiredQualifications: z.array(z.string().min(1)).max(3).default([]),
  preferredQualifications: z.array(z.string().min(1)).max(2).default([]),
  keywords: z.array(z.string().min(1)).max(10).default([]),
  softSkills: z.array(z.string().min(1)).max(4).default([]),
  toolsAndTechnologies: z.array(z.string().min(1)).max(5).default([]),
  certifications: z.array(z.string().min(1)).max(3).default([]),
  summary: z.string().min(1, "Job summary is required."),
}));

const matchScoreSchema = z.number().finite().transform((score) =>
  Math.min(100, Math.max(0, score))
);

export const MatchAnalysisSchema = z.preprocess((value) => normalizeMatchAnalysisPayload(value), z
  .object({
    overallScore: matchScoreSchema,
    status: z.enum(["excellent", "good", "moderate", "weak"]).optional(),
    summary: z.string().min(1),
    categoryScores: z
      .object({
        skills: matchScoreSchema,
        experience: matchScoreSchema,
        keywords: matchScoreSchema,
        education: matchScoreSchema,
        responsibilities: matchScoreSchema,
        qualifications: matchScoreSchema,
      })
      .strict(),
    matchedSkills: z.array(
      z.object({
        skill: z.string().min(1),
        resumeEvidence: z.string().min(1),
        jobRequirement: z.string().min(1),
      }).strict()
    ).max(5),
    missingSkills: z.array(
      z.object({
        skill: z.string().min(1),
        importance: z.enum(["high", "medium", "low"]),
        reason: z.string().min(1),
      }).strict()
    ).max(5),
    partialMatches: z.array(
      z.object({
        requirement: z.string().min(1),
        explanation: z.string().min(1),
        resumeEvidence: z.string().min(1),
      }).strict()
    ).max(3),
    matchedKeywords: z.array(z.string().min(1)).max(8),
    missingKeywords: z.array(z.string().min(1)).max(8),
    responsibilityMatches: z.array(
      z.object({
        responsibility: z.string().min(1),
        matched: z.boolean(),
        explanation: z.string().min(1),
        resumeEvidence: z.string(),
      }).strict()
    ).max(4),
    strengths: z.array(
      z.object({
        title: z.string().min(1),
        explanation: z.string().min(1),
      }).strict()
    ).max(2),
    gaps: z.array(
      z.object({
        category: z.string().min(1),
        title: z.string().min(1),
        explanation: z.string().min(1),
        importance: z.enum(["high", "medium", "low"]),
      }).strict()
    ).max(3),
    recommendations: z.array(
      z.object({
        title: z.string().min(1),
        explanation: z.string().min(1),
      }).strict()
    ).max(3),
  })
  .strict()
  .transform((analysis) => ({
    ...analysis,
    status:
      analysis.overallScore >= 90
        ? "excellent" as const
        : analysis.overallScore >= 75
          ? "good" as const
          : analysis.overallScore >= 60
            ? "moderate" as const
            : "weak" as const,
  })));

export const JobMatchAnalysisSchema = z.preprocess(
  normalizeJobMatchPayload,
  z.object({
    job: JobAnalysisSchema,
    match: MatchAnalysisSchema,
  })
);

export type AIHealthResponse = z.infer<typeof AIHealthResponseSchema>;
export type ATSAnalysis = z.infer<typeof ATSAnalysisSchema>;
export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;
export type MatchAnalysis = z.infer<typeof MatchAnalysisSchema>;

export const TailoringChangeSchema = z.object({
  id: z.string().min(1),
  section: z.enum(["summary", "experience", "projects", "education"]),
  itemId: z.string().nullable(),
  field: z.enum(["summary", "description", "technologies"]),
  currentValue: z.string(),
  suggestedValue: z.string().min(1),
  reason: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]),
  supportedByResume: z.boolean(),
}).strict();

export const TailoringAnalysisSchema = z.object({
  overview: z.object({
    summary: z.string().min(1),
    estimatedImpact: z.enum(["high", "medium", "low"]),
  }).strict(),
  changes: z.array(TailoringChangeSchema),
  skillsSuggestions: z.array(z.object({
    skill: z.string().min(1),
    action: z.enum(["keep", "emphasize", "consider_if_true"]),
    explanation: z.string().min(1),
  }).strict()),
  keywordSuggestions: z.array(z.object({
    keyword: z.string().min(1),
    source: z.literal("job"),
    status: z.enum(["already_present", "missing", "related"]),
    recommendation: z.string().min(1),
  }).strict()),
  otherSuggestions: z.array(z.object({
    section: z.string().min(1),
    title: z.string().min(1),
    explanation: z.string().min(1),
    priority: z.enum(["high", "medium", "low"]),
  }).strict()),
  warnings: z.array(z.string()),
}).strict();

export type TailoringAnalysis = z.infer<typeof TailoringAnalysisSchema>;
export type TailoringChange = z.infer<typeof TailoringChangeSchema>;

const ATSImprovementPlanDataSchema = z.object({
  improvements: z.array(z.object({
    id: z.string().min(1),
    section: z.enum(["personal", "education", "experience", "projects"]),
    itemId: z.string().nullable(),
    type: z.literal("missing_information"),
    field: z.enum(["title", "email", "phone", "location", "website", "linkedin", "github", "startDate", "endDate", "jobTitle", "company", "url", "technologies", "description"]),
    title: z.string().min(1),
    reason: z.string().min(1),
    priority: z.enum(["high", "medium", "low"]),
    requiresUserInput: z.literal(true),
    currentValue: z.string(),
    suggestedValue: z.null(),
  }).strict()).max(6),
  preserve: z.array(z.string().min(1)).max(3).default([]),
}).strict();

/** Canonical planner contract used for both validated model output and API success responses.
 * Accept common JSON fences and a data/plan wrapper, then validate the same strict inner shape.
 */
export const ATSImprovementPlanSchema = z.preprocess((input) => {
  let value = input;
  if (typeof value === "string") {
    const fenced = value.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    try { value = JSON.parse(fenced?.[1] ?? value); } catch { return input; }
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (record.data && typeof record.data === "object") value = record.data;
    else if (record.plan && typeof record.plan === "object") value = record.plan;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const plan = value as Record<string, unknown>;
      // Older prompt variants did not ask for the success discriminator. Add it only
      // when the required planner fields exist; the strict schema still validates every field.
      if (plan.success === undefined && Array.isArray(plan.improvements)) {
        value = { ...plan, success: true };
      }
    }
  }
  return value;
}, z.object({ success: z.literal(true), improvements: ATSImprovementPlanDataSchema.shape.improvements, preserve: ATSImprovementPlanDataSchema.shape.preserve }).strict());

export type ATSImprovementPlan = z.infer<typeof ATSImprovementPlanSchema>;

const experienceEntrySchema = z.object({
  id: z.string().default(""),
  jobTitle: z.string().default(""),
  company: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  description: z.string().default(""),
});

const educationEntrySchema = z.object({
  id: z.string().default(""),
  institution: z.string().default(""),
  degree: z.string().default(""),
  fieldOfStudy: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  description: z.string().default(""),
});

const skillEntrySchema = z.object({
  id: z.string().default(""),
  name: z.string().default(""),
});

const projectEntrySchema = z.object({
  id: z.string().default(""),
  name: z.string().default(""),
  description: z.string().default(""),
  url: z.string().default(""),
  technologies: z.string().default(""),
});

const certificationEntrySchema = z.object({
  id: z.string().default(""),
  name: z.string().default(""),
  organization: z.string().default(""),
  issueDate: z.string().default(""),
  expirationDate: z.string().default(""),
  credentialUrl: z.string().default(""),
});

const languageEntrySchema = z.object({
  id: z.string().default(""),
  language: z.string().default(""),
  proficiency: z.string().default("Professional"),
});

export const ResumeDataSchema = z.object({
  personal: z
    .object({
      firstName: z.string(),
      lastName: z.string(),
      title: z.string(),
      email: z.string(),
      phone: z.string(),
      location: z.string(),
      website: z.string(),
      linkedin: z.string(),
      github: z.string(),
    })
    .strict(),
  summary: z.string(),
  experience: z.array(
    z.object({
      id: z.string(),
      jobTitle: z.string(),
      company: z.string(),
      location: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      current: z.boolean(),
      description: z.string(),
    }).strict()
  ),
  education: z.array(
    z.object({
      id: z.string(),
      institution: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string(),
    }).strict()
  ),
  skills: z.array(z.object({ id: z.string(), name: z.string() }).strict()),
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      url: z.string(),
      technologies: z.string(),
    }).strict()
  ),
  certifications: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      organization: z.string(),
      issueDate: z.string(),
      expirationDate: z.string(),
      credentialUrl: z.string(),
    }).strict()
  ),
  languages: z.array(
    z.object({
      id: z.string(),
      language: z.string(),
      proficiency: z.string(),
    }).strict()
  ),
  templateId: z.string(),
}).strict();

export const ParsedResumeSchema = z.object({
  personal: z
    .object({
      firstName: z.string().default(""),
      lastName: z.string().default(""),
      title: z.string().default(""),
      email: z.string().default(""),
      phone: z.string().default(""),
      location: z.string().default(""),
      website: z.string().default(""),
      linkedin: z.string().default(""),
      github: z.string().default(""),
    })
    .default(emptyPersonalInfo),
  summary: z.string().default(""),
  experience: z.array(experienceEntrySchema).default([]),
  education: z.array(educationEntrySchema).default([]),
  skills: z.array(skillEntrySchema).default([]),
  projects: z.array(projectEntrySchema).default([]),
  certifications: z.array(certificationEntrySchema).default([]),
  languages: z.array(languageEntrySchema).default([]),
  templateId: z.string().default(""),
});

export type ParsedResume = z.infer<typeof ParsedResumeSchema>;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const record = asRecord(item);
          const candidate = asString(record.name ?? record.label ?? record.value ?? record.language ?? record.title);
          return candidate.trim();
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,\s*/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function splitName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function normalizeExperienceEntries(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const record = asRecord(item);
    const title = asString(record.jobTitle ?? record.role ?? record.title);
    const company = asString(record.company ?? record.organization ?? record.employer);
    const location = asString(record.location ?? record.city);
    const description = asString(record.description ?? record.summary ?? record.details ?? record.impact);

    return {
      id: asString(record.id),
      jobTitle: title,
      company,
      location,
      startDate: asString(record.startDate ?? record.from ?? record.start_date),
      endDate: asString(record.endDate ?? record.to ?? record.end_date),
      current: Boolean(record.current),
      description,
    };
  });
}

function normalizeEducationEntries(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    return typeof value === "string" && value.trim()
      ? [{ id: "", institution: value.trim(), degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" }]
      : [];
  }

  return value.map((item) => {
    const record = asRecord(item);
    return {
      id: asString(record.id),
      institution: asString(record.institution ?? record.school ?? record.university ?? record.name),
      degree: asString(record.degree ?? record.degreeName),
      fieldOfStudy: asString(record.fieldOfStudy ?? record.major ?? record.study),
      startDate: asString(record.startDate ?? record.from),
      endDate: asString(record.endDate ?? record.to),
      description: asString(record.description ?? record.summary),
    };
  });
}

function normalizeSkillsEntries(value: unknown): unknown[] {
  return asStringArray(value).map((name) => ({ id: "", name }));
}

function normalizeProjectEntries(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const record = asRecord(item);
    const name = asString(record.name ?? record.projectName ?? record.title);
    const description = asString(record.description ?? record.summary ?? record.details ?? record.impact);
    return {
      id: asString(record.id),
      name,
      description,
      url: asString(record.url ?? record.link),
      technologies: asString(record.technologies ?? record.techStack ?? record.stack),
    };
  });
}

function normalizeCertificationEntries(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    const record = asRecord(item);
    return {
      id: asString(record.id),
      name: asString(record.name ?? record.title),
      organization: asString(record.organization ?? record.issuer),
      issueDate: asString(record.issueDate ?? record.issuedDate),
      expirationDate: asString(record.expirationDate ?? record.expiresAt),
      credentialUrl: asString(record.credentialUrl ?? record.url),
    };
  });
}

function normalizeLanguageEntries(value: unknown): unknown[] {
  return asStringArray(value).map((language) => ({ id: "", language, proficiency: "Professional" }));
}

export function normalizeParsedResume(raw: unknown): ResumeData {
  const obj = asRecord(raw);
  const personal = asRecord(obj.personal);
  const contactInfo = asRecord(obj.contact_info ?? obj.contactInfo);
  const nameValue = asString(obj.name ?? personal.name ?? `${asString(personal.firstName)} ${asString(personal.lastName)}`.trim());
  const splitNameValue = splitName(nameValue);

  const normalized = sanitizeResumeData({
    personal: {
      firstName: asString(personal.firstName ?? obj.firstName ?? splitNameValue.firstName),
      lastName: asString(personal.lastName ?? obj.lastName ?? splitNameValue.lastName),
      title: asString(personal.title ?? obj.title ?? contactInfo.title),
      email: asString(personal.email ?? contactInfo.email ?? obj.email),
      phone: asString(personal.phone ?? contactInfo.phone ?? obj.phone),
      location: asString(personal.location ?? contactInfo.location ?? obj.location),
      website: asString(personal.website ?? obj.website),
      linkedin: asString(personal.linkedin ?? obj.linkedin),
      github: asString(personal.github ?? obj.github),
    },
    summary: asString(obj.summary ?? personal.summary),
    experience: normalizeExperienceEntries(obj.experience ?? personal.experience),
    education: normalizeEducationEntries(obj.education ?? personal.education),
    skills: normalizeSkillsEntries(obj.skills ?? personal.skills),
    projects: normalizeProjectEntries(obj.projects ?? personal.projects),
    certifications: normalizeCertificationEntries(obj.certifications ?? personal.certifications),
    languages: normalizeLanguageEntries(obj.languages ?? personal.languages),
    templateId: asString(obj.templateId),
  });

  return normalized;
}

// Some reasoning models prepend <think>...</think>; remove it before parsing.
function stripReasoning(raw: string): string {
  return raw.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, "");
}

export function parseAndValidate<T>(
  rawInput: string,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; error: string } {
  const raw = stripReasoning(rawInput);
  const candidateSources = [raw.trim()];

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    candidateSources.push(fenced[1].trim());
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidateSources.push(raw.slice(firstBrace, lastBrace + 1));
  }

  let lastError = "AI response was not valid JSON.";

  for (const candidate of candidateSources) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      continue;
    }

    const result = schema.safeParse(parsed);
    if (result.success) {
      return { success: true, data: result.data };
    }

    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    lastError = `AI response failed validation: ${issues}`;
  }

  return { success: false, error: lastError };
}

export function parseResumeData(rawInput: string): { success: true; data: ResumeData } | { success: false; error: string } {
  const raw = stripReasoning(rawInput);
  const candidateSources = [raw.trim()];

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    candidateSources.push(fenced[1].trim());
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    candidateSources.push(raw.slice(firstBrace, lastBrace + 1));
  }

  for (const candidate of candidateSources) {
    const direct = parseAndValidate(candidate, ParsedResumeSchema);
    if (direct.success) {
      return direct;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      continue;
    }

    const normalized = normalizeParsedResume(parsed);
    const validated = ParsedResumeSchema.safeParse(normalized);
    if (!validated.success) {
      const issues = validated.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      return { success: false, error: `AI response failed validation: ${issues}` };
    }

    return { success: true, data: validated.data };
  }

  return { success: false, error: "AI response was not valid JSON." };
}
