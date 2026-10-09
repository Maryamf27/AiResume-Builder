"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  CertificationEntry,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  PersonalInfo,
  ProjectEntry,
  ResumeArrayField,
  ResumeData,
  ResumeRecord,
  ResumeSectionId,
  SkillEntry,
} from "@/types/resume";
import { createEmptyResumeData, DEFAULT_RESUME_TITLE, RESUME_SCHEMA_VERSION } from "@/lib/resume/constants";
import { calculateCompleteness } from "@/lib/resume/completeness";
import { createId } from "@/lib/resume/id";
import { createClient } from "@/lib/supabase/client";
import { hasResumeContent, shouldPersistResumeDraft } from "@/lib/resume/guest-import";
import {
  clearGuestResume,
  clearPendingImportedResume,
  loadGuestResume,
  loadPendingImportedResume,
} from "@/lib/resume/storage";
import { createGuestPersistenceAdapter } from "@/lib/resume/persistence/guest-adapter";
import { createSupabasePersistenceAdapter } from "@/lib/resume/persistence/supabase-adapter";
import type { ResumePersistenceAdapter } from "@/lib/resume/persistence/types";
import type { PublishedTemplate } from "@/lib/templates/types";
import { loadPublishedTemplatesClient } from "@/lib/templates/client-cache";
import { updateCachedResume } from "@/lib/resume/client-cache";
import { TailoringChangeSchema, type TailoringChange } from "@/lib/ai/schemas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type PersistenceMode = "guest" | "authenticated";
export type TemplatesDialogState = "closed" | "open";

export interface PreparedResumePdf {
  document: string;
  filename: string;
  pdf: Blob;
}

const AUTOSAVE_DEBOUNCE_MS = 800;

interface ResumeBuilderContextValue {
  resumeData: ResumeData;
  hydrated: boolean;
  applyTailoringChanges: (
    changes: TailoringChange[]
  ) => { success: true; appliedCount: number } | { success: false; message: string };
  title: string;
  updateTitle: (value: string) => void;
  completeness: number;
  preparedResumePdf: PreparedResumePdf | null;
  setPreparedResumePdf: (prepared: PreparedResumePdf | null) => void;

  persistenceMode: PersistenceMode;
  userId: string | null;
  saveStatus: SaveStatus;
  saveError: string | null;
  retrySave: () => void;
  loadFailed: boolean;
  retryLoad: () => void;
  hasPendingGuestResume: boolean;
  guestImportNotice: boolean;
  guestImportError: string | null;
  importGuestResume: () => Promise<void>;
  discardGuestResume: () => void;
  dismissGuestImportNotice: () => void;

  templates: PublishedTemplate[];
  templatesStatus: "loading" | "ready" | "error";
  selectedTemplate: PublishedTemplate | null;
  selectTemplate: (id: string) => void;
  templatesDialogOpen: boolean;
  openTemplatesDialog: () => void;
  closeTemplatesDialog: () => void;

  activeSection: ResumeSectionId;
  setActiveSection: (section: ResumeSectionId) => void;

  updatePersonal: (patch: Partial<PersonalInfo>) => void;
  updateSummary: (value: string) => void;

  addExperience: () => void;
  updateExperience: (id: string, patch: Partial<ExperienceEntry>) => void;
  removeExperience: (id: string) => void;

  addEducation: () => void;
  updateEducation: (id: string, patch: Partial<EducationEntry>) => void;
  removeEducation: (id: string) => void;

  addSkill: (name: string) => void;
  removeSkill: (id: string) => void;

  addProject: () => void;
  updateProject: (id: string, patch: Partial<ProjectEntry>) => void;
  removeProject: (id: string) => void;

  addCertification: () => void;
  updateCertification: (id: string, patch: Partial<CertificationEntry>) => void;
  removeCertification: (id: string) => void;

  addLanguage: () => void;
  updateLanguage: (id: string, patch: Partial<LanguageEntry>) => void;
  removeLanguage: (id: string) => void;
}

const ResumeBuilderContext = createContext<ResumeBuilderContextValue | null>(null);

function addEntry<T>(items: T[], entry: T): T[] {
  return [...items, entry];
}

function updateEntry<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>
): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function removeEntry<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

export function ResumeBuilderProvider({
  children,
  resumeId,
  initialTemplateSlug,
  startNew = false,
}: {
  children: ReactNode;
  resumeId?: string;
  initialTemplateSlug?: string;
 
  startNew?: boolean;
}) {
  const [resumeData, setResumeData] = useState<ResumeData>(createEmptyResumeData);
  const [title, setTitle] = useState<string>(DEFAULT_RESUME_TITLE);
  const [activeSection, setActiveSection] = useState<ResumeSectionId>("personal");
  const [preparedResumePdf, setPreparedResumePdf] = useState<PreparedResumePdf | null>(null);

  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>("guest");
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pendingGuest, setPendingGuest] = useState<ResumeRecord | null>(null);
  const [guestImportNotice, setGuestImportNotice] = useState(false);
  const [guestImportError, setGuestImportError] = useState<string | null>(null);

  const [templates, setTemplates] = useState<PublishedTemplate[]>([]);
  const [templatesStatus, setTemplatesStatus] = useState<"loading" | "ready" | "error">("loading");
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
  const openTemplatesDialog = useCallback(() => setTemplatesDialogOpen(true), []);
  const closeTemplatesDialog = useCallback(() => setTemplatesDialogOpen(false), []);

  const recordIdRef = useRef<string>(createId());
  const createdAtRef = useRef<string>(new Date().toISOString());
  const hasSyncedAfterLoadRef = useRef(false);
  const bootstrapRunRef = useRef(0);
  const persistedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDraftRef = useRef<{
    resumeData: ResumeData;
    title: string;
    hydrated: boolean;
    persistenceMode: PersistenceMode;
    userId: string | null;
    adapter: ResumePersistenceAdapter;
    buildRecord: () => ResumeRecord;
  } | null>(null);

  const bootstrap = useCallback(async (runId = ++bootstrapRunRef.current) => {
    let user: { id: string } | null = null;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (error) {
      console.error("Auth check failed; continuing as guest:", error);
    }

    const loadAdapter: ResumePersistenceAdapter = user
      ? createSupabasePersistenceAdapter(user.id, resumeId)
      : createGuestPersistenceAdapter();

    let stored: ResumeRecord | null;
    let prefill: ResumeRecord | null = null;
    try {
      const latest = await loadAdapter.load();
      if (user && startNew && !resumeId) {
        prefill = latest;
        stored = null;
      } else {
        stored = latest;
      }
    } catch (error) {
      if (runId !== bootstrapRunRef.current) return;
      console.error("Resume load failed:", error);
      setPersistenceMode(loadAdapter.mode);
      setUserId(user?.id ?? null);
      setLoadFailed(true);
      return;
    }
    if (runId !== bootstrapRunRef.current) return;

    if (user && resumeId && !stored) {
      setPersistenceMode(loadAdapter.mode);
      setUserId(user.id);
      setLoadFailed(true);
      return;
    }

    let guest: ResumeRecord | null = null;
    let importedFromGuest = false;
    if (user) {
      guest = loadGuestResume();
      if (guest && !hasResumeContent(guest.data)) {
        clearGuestResume();
        guest = null;
      }
    }

    if (
      user &&
      startNew &&
      !resumeId &&
      guest &&
      (!prefill || !hasResumeContent(prefill.data))
    ) {
      prefill = guest;
      guest = null;
    }

    if (user && guest) {
      if (!stored && !(startNew && !resumeId)) {
        const record: ResumeRecord = {
          ...guest,
          id: createId(),
          userId: user.id,
          updatedAt: new Date().toISOString(),
        };
        const result = await loadAdapter.save(record);
        if (result.ok) {
          clearGuestResume();
          stored = record;
          importedFromGuest = true;
          guest = null;
        }
      }
      if (runId !== bootstrapRunRef.current) return;
    }

    setPendingGuest(guest);
    setGuestImportNotice(importedFromGuest);

    if (stored) {
      persistedRef.current = user !== null;
      setResumeData(stored.data);
      setTitle(stored.title);
      recordIdRef.current = stored.id;
      createdAtRef.current = stored.createdAt;
    } else {
      persistedRef.current = false;
      setResumeData(prefill && hasResumeContent(prefill.data) ? prefill.data : createEmptyResumeData());
      setTitle(DEFAULT_RESUME_TITLE);
      recordIdRef.current = createId();
      createdAtRef.current = new Date().toISOString();
    }

    setPersistenceMode(loadAdapter.mode);
    setUserId(user?.id ?? null);
    setLoadFailed(false);
    setHydrated(true);
  }, [resumeId, startNew]);

  useEffect(() => {
    // Defer so the async bootstrap (and its setState calls) stays out of the
    // effect body.
    const timer = setTimeout(() => {
      void bootstrap(++bootstrapRunRef.current);
    }, 0);
    return () => clearTimeout(timer);
  }, [bootstrap]);

  useEffect(() => {
    if (!hydrated) return;

    const imported = loadPendingImportedResume();
    if (!imported) return;

    clearPendingImportedResume();
    const timer = setTimeout(() => {
      setResumeData(imported);
      const displayName = [imported.personal.firstName, imported.personal.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      setTitle(displayName || DEFAULT_RESUME_TITLE);
    }, 0);

    return () => clearTimeout(timer);
  }, [hydrated]);

  // Published templates are readable by everyone (guests included) through RLS.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadPublishedTemplatesClient();
        if (cancelled) return;
        setTemplates(data ?? []);
        setTemplatesStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error("Could not load templates:", err);
        setTemplatesStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const retryLoad = useCallback(() => {
    setLoadFailed(false);
    void bootstrap();
  }, [bootstrap]);

  const adapter = useMemo<ResumePersistenceAdapter>(() => {
    if (persistenceMode === "authenticated" && userId) {
      return createSupabasePersistenceAdapter(userId, resumeId);
    }
    return createGuestPersistenceAdapter();
  }, [persistenceMode, userId, resumeId]);

  const buildRecord = useCallback(
    (): ResumeRecord => ({
      id: recordIdRef.current,
      userId,
      title,
      data: resumeData,
      version: RESUME_SCHEMA_VERSION,
      createdAt: createdAtRef.current,
      updatedAt: new Date().toISOString(),
    }),
    [userId, title, resumeData]
  );

  useEffect(() => {
    latestDraftRef.current = {
      resumeData,
      title,
      hydrated,
      persistenceMode,
      userId,
      adapter,
      buildRecord,
    };
  }, [adapter, buildRecord, hydrated, persistenceMode, resumeData, title, userId]);

  const runSave = useCallback(() => {
    if (!shouldPersistResumeDraft(resumeData, title, persistedRef.current)) {
      setSaveStatus("idle");
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);
    adapter.save(buildRecord()).then((result) => {
      if (result.ok) {
        if (adapter.mode === "authenticated") {
          const firstSave = !persistedRef.current;
          persistedRef.current = true;
          if (firstSave && startNew && typeof window !== "undefined") {
            window.history.replaceState(null, "", `/builder?id=${recordIdRef.current}`);
          }
          if (userId) {
            updateCachedResume(userId, {
              id: recordIdRef.current,
              title: title || DEFAULT_RESUME_TITLE,
              createdAt: createdAtRef.current,
              updatedAt: new Date().toISOString(),
            });
          }
        }
        setSaveStatus("saved");
      } else {
        console.error("Resume save failed:", result.error);
        setSaveStatus("error");
        setSaveError(result.error);
      }
    });
  }, [adapter, buildRecord, resumeData, startNew, title]);

  useEffect(() => {
    if (!hydrated) return;
    if (!hasSyncedAfterLoadRef.current) {
      hasSyncedAfterLoadRef.current = true;
      return;
    }

    const shouldSave = shouldPersistResumeDraft(resumeData, title, persistedRef.current);
    if (!shouldSave) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      setSaveStatus("idle");
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      runSave();
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [resumeData, title, hydrated, runSave]);

  useEffect(() => {
    return () => {
      const draft = latestDraftRef.current;
      if (!draft || !draft.hydrated) return;
      if (!shouldPersistResumeDraft(draft.resumeData, draft.title, persistedRef.current)) return;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      void draft.adapter.save(draft.buildRecord());
    };
  }, []);

  const importGuestResume = useCallback(async () => {
    if (!pendingGuest || !userId) return;
    setGuestImportError(null);

    const record: ResumeRecord = {
      ...pendingGuest,
      id: recordIdRef.current,
      userId,
      createdAt: createdAtRef.current,
      updatedAt: new Date().toISOString(),
    };
    const result = await createSupabasePersistenceAdapter(userId).save(record);
    if (!result.ok) {
      setGuestImportError(result.error);
      return;
    }

    persistedRef.current = true;
    clearGuestResume();
    setResumeData(record.data);
    setTitle(record.title);
    setPendingGuest(null);
    setGuestImportNotice(true);
  }, [pendingGuest, userId]);

  const discardGuestResume = useCallback(() => {
    clearGuestResume();
    setPendingGuest(null);
    setGuestImportError(null);
  }, []);

  const dismissGuestImportNotice = useCallback(() => {
    setGuestImportNotice(false);
  }, []);

  const retrySave = useCallback(() => {
    runSave();
  }, [runSave]);

  const updateTitle = useCallback((value: string) => {
    setTitle(value);
  }, []);

  const updatePersonal = useCallback((patch: Partial<PersonalInfo>) => {
    setResumeData((prev) => ({ ...prev, personal: { ...prev.personal, ...patch } }));
  }, []);

  const updateSummary = useCallback((value: string) => {
    setResumeData((prev) => ({ ...prev, summary: value }));
  }, []);

  const applyTailoringChanges = useCallback(
    (changes: TailoringChange[]) => {
      if (changes.length === 0) {
        return { success: false as const, message: "Select at least one change to apply." };
      }

      const seenIds = new Set<string>();
      const seenTargets = new Set<string>();
      const next = { ...resumeData };
      let nextExperience = resumeData.experience;
      let nextProjects = resumeData.projects;
      let nextEducation = resumeData.education;
      let nextSummary = resumeData.summary;
      let targetSection: ResumeSectionId | null = null;

      for (const rawChange of changes) {
        const parsed = TailoringChangeSchema.safeParse(rawChange);
        if (!parsed.success) {
          return { success: false as const, message: "One or more selected changes are invalid. No changes were applied." };
        }

        const change = parsed.data;
        if (
          !change.supportedByResume ||
          !change.suggestedValue.trim() ||
          change.suggestedValue.length > 20000 ||
          change.suggestedValue === change.currentValue ||
          seenIds.has(change.id)
        ) {
          return { success: false as const, message: "One or more selected changes could not be verified. No changes were applied." };
        }
        seenIds.add(change.id);

        if (change.section === "summary") {
          if (change.itemId !== null || change.field !== "summary") {
            return { success: false as const, message: "One or more selected changes have an invalid target. No changes were applied." };
          }
          const target = "summary";
          if (seenTargets.has(target) || resumeData.summary !== change.currentValue) {
            return { success: false as const, message: "Your resume changed since these suggestions were generated. No changes were applied; regenerate suggestions and review them again." };
          }
          seenTargets.add(target);
          nextSummary = change.suggestedValue;
          targetSection ??= "summary";
          continue;
        }

        if (!change.itemId) {
          return { success: false as const, message: "One or more selected changes have an invalid target. No changes were applied." };
        }

        const target = `${change.section}:${change.itemId}:${change.field}`;
        if (seenTargets.has(target)) {
          return { success: false as const, message: "Multiple selected changes target the same resume field. Select only one for that field." };
        }
        seenTargets.add(target);

        if (change.section === "experience" && change.field === "description") {
          const item = resumeData.experience.find((entry) => entry.id === change.itemId);
          if (!item || item.description !== change.currentValue) {
            return { success: false as const, message: "Your resume changed since these suggestions were generated. No changes were applied; regenerate suggestions and review them again." };
          }
          nextExperience = nextExperience.map((entry) =>
            entry.id === change.itemId ? { ...entry, description: change.suggestedValue } : entry
          );
          targetSection ??= "experience";
          continue;
        }

        if (change.section === "projects" && (change.field === "description" || change.field === "technologies")) {
          const item = resumeData.projects.find((entry) => entry.id === change.itemId);
          const currentValue = change.field === "description" ? item?.description : item?.technologies;
          if (!item || currentValue !== change.currentValue) {
            return { success: false as const, message: "Your resume changed since these suggestions were generated. No changes were applied; regenerate suggestions and review them again." };
          }
          nextProjects = nextProjects.map((entry) =>
            entry.id === change.itemId
              ? { ...entry, [change.field]: change.suggestedValue }
              : entry
          );
          targetSection ??= "projects";
          continue;
        }

        if (change.section === "education" && change.field === "description") {
          const item = resumeData.education.find((entry) => entry.id === change.itemId);
          if (!item || item.description !== change.currentValue) {
            return { success: false as const, message: "Your resume changed since these suggestions were generated. No changes were applied; regenerate suggestions and review them again." };
          }
          nextEducation = nextEducation.map((entry) =>
            entry.id === change.itemId ? { ...entry, description: change.suggestedValue } : entry
          );
          targetSection ??= "education";
          continue;
        }

        return { success: false as const, message: "One or more selected changes target an unsupported field. No changes were applied." };
      }

      next.summary = nextSummary;
      next.experience = nextExperience;
      next.projects = nextProjects;
      next.education = nextEducation;
      setResumeData(next);
      if (targetSection) setActiveSection(targetSection);
      return { success: true as const, appliedCount: changes.length };
    },
    [resumeData]
  );

  const updateArrayField = useCallback(
    <K extends ResumeArrayField>(
      field: K,
      updater: (items: ResumeData[K]) => ResumeData[K]
    ) => {
      setResumeData((prev): ResumeData => {
        switch (field) {
          case "experience": {
            const fn = updater as unknown as (items: ExperienceEntry[]) => ExperienceEntry[];
            return { ...prev, experience: fn(prev.experience) };
          }
          case "education": {
            const fn = updater as unknown as (items: EducationEntry[]) => EducationEntry[];
            return { ...prev, education: fn(prev.education) };
          }
          case "skills": {
            const fn = updater as unknown as (items: SkillEntry[]) => SkillEntry[];
            return { ...prev, skills: fn(prev.skills) };
          }
          case "projects": {
            const fn = updater as unknown as (items: ProjectEntry[]) => ProjectEntry[];
            return { ...prev, projects: fn(prev.projects) };
          }
          case "certifications": {
            const fn = updater as unknown as (items: CertificationEntry[]) => CertificationEntry[];
            return { ...prev, certifications: fn(prev.certifications) };
          }
          case "languages": {
            const fn = updater as unknown as (items: LanguageEntry[]) => LanguageEntry[];
            return { ...prev, languages: fn(prev.languages) };
          }
          default:
            return prev;
        }
      });
    },
    []
  );

  const addExperience = useCallback(() => {
    const entry: ExperienceEntry = {
      id: createId(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    updateArrayField("experience", (items) => addEntry(items, entry));
    setActiveSection("experience");
  }, [updateArrayField]);

  const updateExperience = useCallback(
    (id: string, patch: Partial<ExperienceEntry>) => {
      updateArrayField("experience", (items) => updateEntry(items, id, patch));
    },
    [updateArrayField]
  );

  const removeExperience = useCallback(
    (id: string) => {
      updateArrayField("experience", (items) => removeEntry(items, id));
    },
    [updateArrayField]
  );

  const addEducation = useCallback(() => {
    const entry: EducationEntry = {
      id: createId(),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    updateArrayField("education", (items) => addEntry(items, entry));
    setActiveSection("education");
  }, [updateArrayField]);

  const updateEducation = useCallback(
    (id: string, patch: Partial<EducationEntry>) => {
      updateArrayField("education", (items) => updateEntry(items, id, patch));
    },
    [updateArrayField]
  );

  const removeEducation = useCallback(
    (id: string) => {
      updateArrayField("education", (items) => removeEntry(items, id));
    },
    [updateArrayField]
  );

  const addSkill = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const entry: SkillEntry = { id: createId(), name: trimmed };
      updateArrayField("skills", (items) => addEntry(items, entry));
    },
    [updateArrayField]
  );

  const removeSkill = useCallback(
    (id: string) => {
      updateArrayField("skills", (items) => removeEntry(items, id));
    },
    [updateArrayField]
  );

  const addProject = useCallback(() => {
    const entry: ProjectEntry = {
      id: createId(),
      name: "",
      description: "",
      url: "",
      technologies: "",
    };
    updateArrayField("projects", (items) => addEntry(items, entry));
    setActiveSection("projects");
  }, [updateArrayField]);

  const updateProject = useCallback(
    (id: string, patch: Partial<ProjectEntry>) => {
      updateArrayField("projects", (items) => updateEntry(items, id, patch));
    },
    [updateArrayField]
  );

  const removeProject = useCallback(
    (id: string) => {
      updateArrayField("projects", (items) => removeEntry(items, id));
    },
    [updateArrayField]
  );

  const addCertification = useCallback(() => {
    const entry: CertificationEntry = {
      id: createId(),
      name: "",
      organization: "",
      issueDate: "",
      expirationDate: "",
      credentialUrl: "",
    };
    updateArrayField("certifications", (items) => addEntry(items, entry));
    setActiveSection("certifications");
  }, [updateArrayField]);

  const updateCertification = useCallback(
    (id: string, patch: Partial<CertificationEntry>) => {
      updateArrayField("certifications", (items) => updateEntry(items, id, patch));
    },
    [updateArrayField]
  );

  const removeCertification = useCallback(
    (id: string) => {
      updateArrayField("certifications", (items) => removeEntry(items, id));
    },
    [updateArrayField]
  );

  const addLanguage = useCallback(() => {
    const entry: LanguageEntry = { id: createId(), language: "", proficiency: "Professional" };
    updateArrayField("languages", (items) => addEntry(items, entry));
    setActiveSection("languages");
  }, [updateArrayField]);

  const updateLanguage = useCallback(
    (id: string, patch: Partial<LanguageEntry>) => {
      updateArrayField("languages", (items) => updateEntry(items, id, patch));
    },
    [updateArrayField]
  );

  const removeLanguage = useCallback(
    (id: string) => {
      updateArrayField("languages", (items) => removeEntry(items, id));
    },
    [updateArrayField]
  );

  // Falls back to the first published template when nothing is chosen yet,
  // or when the chosen one was unpublished/deleted since.
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === resumeData.templateId) ?? templates[0] ?? null,
    [templates, resumeData.templateId]
  );

  const selectTemplate = useCallback(
    (id: string) => {
      // Compare with the stored choice, not the displayed one: picking the
      // template that is only showing as the default still saves the choice
      // and records the selection.
      if (id === resumeData.templateId) return;
      setResumeData((prev) => ({ ...prev, templateId: id }));

      const isPublishedSelection = templates.some((template) => template.id === id);
      if (!isPublishedSelection) return;

      // Usage analytics: fire-and-forget, never blocks or breaks the builder.
      void createClient()
        .from("template_events")
        .insert({ template_id: id, user_id: userId, event_type: "selected" })
        .then(({ error }) => {
          if (error) console.warn("Could not record template selection:", error.message);
        });
    },
    [resumeData.templateId, templates, userId]
  );

  // "Use template" on /templates lands here with ?template=<slug>. Apply it once
  // the resume and the published templates have both loaded, then drop the
  // parameter so a refresh doesn't undo a later choice.
  const appliedInitialTemplateRef = useRef(false);
  useEffect(() => {
    if (!initialTemplateSlug || appliedInitialTemplateRef.current) return;
    if (!hydrated || templatesStatus === "loading") return;

    // Deferred, like bootstrap above, so the state update stays out of the effect body.
    const timer = setTimeout(() => {
      if (appliedInitialTemplateRef.current) return;
      appliedInitialTemplateRef.current = true;

      const match = templates.find((t) => t.slug === initialTemplateSlug);
      if (match) selectTemplate(match.id);

      const url = new URL(window.location.href);
      url.searchParams.delete("template");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }, 0);
    return () => clearTimeout(timer);
  }, [initialTemplateSlug, hydrated, templatesStatus, templates, selectTemplate]);

  const completeness = useMemo(() => calculateCompleteness(resumeData), [resumeData]);

  const value: ResumeBuilderContextValue = {
    resumeData,
    hydrated,
    applyTailoringChanges,
    title,
    updateTitle,
    completeness,
    preparedResumePdf,
    setPreparedResumePdf,
    persistenceMode,
    userId,
    saveStatus,
    saveError,
    retrySave,
    loadFailed,
    retryLoad,
    hasPendingGuestResume: pendingGuest !== null,
    guestImportNotice,
    guestImportError,
    importGuestResume,
    discardGuestResume,
    dismissGuestImportNotice,
    templates,
    templatesStatus,
    selectedTemplate,
    selectTemplate,
    templatesDialogOpen,
    openTemplatesDialog,
    closeTemplatesDialog,
    activeSection,
    setActiveSection,
    updatePersonal,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    removeSkill,
    addProject,
    updateProject,
    removeProject,
    addCertification,
    updateCertification,
    removeCertification,
    addLanguage,
    updateLanguage,
    removeLanguage,
  };

  return (
    <ResumeBuilderContext.Provider value={value}>{children}</ResumeBuilderContext.Provider>
  );
}

export function useResumeBuilder(): ResumeBuilderContextValue {
  const ctx = useContext(ResumeBuilderContext);
  if (!ctx) {
    throw new Error("useResumeBuilder must be used within a ResumeBuilderProvider");
  }
  return ctx;
}
