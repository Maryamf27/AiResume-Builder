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
import { createGuestPersistenceAdapter } from "@/lib/resume/persistence/guest-adapter";
import { createSupabasePersistenceAdapter } from "@/lib/resume/persistence/supabase-adapter";
import type { ResumePersistenceAdapter } from "@/lib/resume/persistence/types";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type PersistenceMode = "guest" | "authenticated";

const AUTOSAVE_DEBOUNCE_MS = 800;

interface ResumeBuilderContextValue {
  resumeData: ResumeData;
  title: string;
  updateTitle: (value: string) => void;
  completeness: number;

  persistenceMode: PersistenceMode;
  saveStatus: SaveStatus;
  saveError: string | null;
  retrySave: () => void;
  loadFailed: boolean;
  retryLoad: () => void;

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

export function ResumeBuilderProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(createEmptyResumeData);
  const [title, setTitle] = useState<string>(DEFAULT_RESUME_TITLE);
  const [activeSection, setActiveSection] = useState<ResumeSectionId>("personal");

  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>("guest");
  const [userId, setUserId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const recordIdRef = useRef<string>(createId());
  const createdAtRef = useRef<string>(new Date().toISOString());
  const hasSyncedAfterLoadRef = useRef(false);
  const bootstrapRunRef = useRef(0);

  const bootstrap = useCallback(async () => {
    const runId = ++bootstrapRunRef.current;

    let user: { id: string } | null = null;
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (error) {
      console.error("Auth check failed; continuing as guest:", error);
    }

    const loadAdapter: ResumePersistenceAdapter = user
      ? createSupabasePersistenceAdapter(user.id)
      : createGuestPersistenceAdapter();

    let stored: ResumeRecord | null;
    try {
      stored = await loadAdapter.load();
    } catch (error) {
      if (runId !== bootstrapRunRef.current) return;
      console.error("Resume load failed:", error);
      setPersistenceMode(loadAdapter.mode);
      setUserId(user?.id ?? null);
      setLoadFailed(true);
      return;
    }
    if (runId !== bootstrapRunRef.current) return;

    if (stored) {
      setResumeData(stored.data);
      setTitle(stored.title);
      recordIdRef.current = stored.id;
      createdAtRef.current = stored.createdAt;
    } else {
      recordIdRef.current = createId();
      createdAtRef.current = new Date().toISOString();
    }

    setPersistenceMode(loadAdapter.mode);
    setUserId(user?.id ?? null);
    setLoadFailed(false);
    setHydrated(true);
  }, []);

  useEffect(() => {
    void bootstrap();
    return () => {
      bootstrapRunRef.current++;
    };
  }, [bootstrap]);

  const retryLoad = useCallback(() => {
    setLoadFailed(false);
    void bootstrap();
  }, [bootstrap]);

  const adapter = useMemo<ResumePersistenceAdapter>(() => {
    if (persistenceMode === "authenticated" && userId) {
      return createSupabasePersistenceAdapter(userId);
    }
    return createGuestPersistenceAdapter();
  }, [persistenceMode, userId]);

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

  const runSave = useCallback(() => {
    setSaveStatus("saving");
    setSaveError(null);
    adapter.save(buildRecord()).then((result) => {
      if (result.ok) {
        setSaveStatus("saved");
      } else {
        console.error("Resume save failed:", result.error);
        setSaveStatus("error");
        setSaveError(result.error);
      }
    });
  }, [adapter, buildRecord]);
  useEffect(() => {
    if (!hydrated) return;
    if (!hasSyncedAfterLoadRef.current) {
      hasSyncedAfterLoadRef.current = true;
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);
    const timeout = setTimeout(runSave, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [resumeData, title, hydrated]);

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

  const completeness = useMemo(() => calculateCompleteness(resumeData), [resumeData]);

  const value: ResumeBuilderContextValue = {
    resumeData,
    title,
    updateTitle,
    completeness,
    persistenceMode,
    saveStatus,
    saveError,
    retrySave,
    loadFailed,
    retryLoad,
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
