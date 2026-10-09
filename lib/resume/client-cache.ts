import { getQueryClient } from "@/lib/query/query-client";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_RESUME_TITLE } from "@/lib/resume/constants";

export interface CachedResumeSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string | null;
}

/** Resume-list cache, now backed by TanStack Query so every screen shares it. */
export const resumeKeys = {
  all: ["resumes"] as const,
  list: (userId: string) => ["resumes", "list", userId] as const,
};

export const RESUME_LIST_STALE_MS = 5 * 60 * 1_000;

export async function fetchResumeSummaries(userId: string): Promise<CachedResumeSummary[]> {
  const { data, error } = await createClient()
    .from("resumes")
    .select("id, title, created_at, updated_at, template_id:data->>templateId")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title || DEFAULT_RESUME_TITLE,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    templateId: row.template_id,
  }));
}

export function resumeListQueryOptions(userId: string) {
  return {
    queryKey: resumeKeys.list(userId),
    queryFn: () => fetchResumeSummaries(userId),
    staleTime: RESUME_LIST_STALE_MS,
  };
}

/** Inserts or updates one resume in the cached list (no-op if the list was never loaded). */
export function updateCachedResume(userId: string, resume: CachedResumeSummary): void {
  getQueryClient().setQueryData<CachedResumeSummary[]>(resumeKeys.list(userId), (current) => {
    if (!current) return current;
    const existing = current.find((item) => item.id === resume.id);
    const value = current.filter((item) => item.id !== resume.id);
    value.push({ ...existing, ...resume });
    value.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    return value;
  });
}

export function removeCachedResume(userId: string, resumeId: string): void {
  getQueryClient().setQueryData<CachedResumeSummary[]>(resumeKeys.list(userId), (current) =>
    current ? current.filter((item) => item.id !== resumeId) : current
  );
}

/** Drops cached resume lists (all users when no id is given), e.g. on sign-out or account deletion. */
export function clearResumeCache(userId?: string): void {
  const client = getQueryClient();
  void client.cancelQueries({ queryKey: userId ? resumeKeys.list(userId) : resumeKeys.all });
  client.removeQueries({ queryKey: userId ? resumeKeys.list(userId) : resumeKeys.all });
}
