import { createClient } from "@/lib/supabase/client";
import { DEFAULT_RESUME_TITLE } from "@/lib/resume/constants";

export interface CachedResumeSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string | null;
}

const TTL_MS = 5 * 60 * 1_000;
const cache = new Map<string, { value: CachedResumeSummary[]; expiresAt: number }>();
const inFlight = new Map<string, Promise<CachedResumeSummary[]>>();
const generations = new Map<string, number>();

export function getResumeSummaries(userId: string): Promise<CachedResumeSummary[]> {
  const current = cache.get(userId);
  if (current && current.expiresAt > Date.now()) {
    log("hit", 0);
    return Promise.resolve(current.value);
  }
  const existing = inFlight.get(userId);
  if (existing) {
    log("in-flight", 0);
    return existing;
  }

  const started = performance.now();
  const generation = generations.get(userId) ?? 0;
  log("miss", 0);
  const request = (async () => {
      const { data, error } = await createClient()
        .from("resumes")
        .select("id, title, created_at, updated_at, template_id:data->>templateId")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const summaries = (data ?? []).map((row) => ({
        id: row.id,
        title: row.title || DEFAULT_RESUME_TITLE,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        templateId: row.template_id,
      }));
      if ((generations.get(userId) ?? 0) === generation) {
        cache.set(userId, { value: summaries, expiresAt: Date.now() + TTL_MS });
      }
      log("loaded", performance.now() - started);
      return summaries;
    })().catch((error: unknown) => {
      if (current) {
        if (process.env.NODE_ENV === "development") console.info("[data-cache] resume-list stale fallback");
        return current.value;
      }
      throw error;
    })
    .finally(() => inFlight.delete(userId));
  inFlight.set(userId, request);
  return request;
}

export function updateCachedResume(userId: string, resume: CachedResumeSummary): void {
  const current = cache.get(userId);
  if (!current) return;
  const existing = current.value.find((item) => item.id === resume.id);
  const value = current.value.filter((item) => item.id !== resume.id);
  value.push({ ...existing, ...resume });
  value.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  cache.set(userId, { value, expiresAt: Date.now() + TTL_MS });
}

export function removeCachedResume(userId: string, resumeId: string): void {
  const current = cache.get(userId);
  if (!current) return;
  cache.set(userId, {
    value: current.value.filter((item) => item.id !== resumeId),
    expiresAt: Date.now() + TTL_MS,
  });
}

export function clearResumeCache(userId?: string): void {
  if (userId) {
    generations.set(userId, (generations.get(userId) ?? 0) + 1);
    cache.delete(userId);
    inFlight.delete(userId);
  } else {
    for (const key of new Set([...cache.keys(), ...inFlight.keys(), ...generations.keys()])) {
      generations.set(key, (generations.get(key) ?? 0) + 1);
    }
    cache.clear();
    inFlight.clear();
  }
}

function log(result: "hit" | "miss" | "in-flight" | "loaded", durationMs: number): void {
  if (process.env.NODE_ENV !== "development") return;
  console.info(`[data-cache] resume-list ${result}${durationMs ? ` ${durationMs.toFixed(0)}ms` : ""}`);
}
