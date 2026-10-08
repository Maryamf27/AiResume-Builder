import { createClient } from "@/lib/supabase/client";
import type { PublishedTemplate } from "@/lib/templates/types";

const TEMPLATE_CACHE_TTL_MS = 5 * 60 * 1_000;
let cached: { expiresAt: number; value: PublishedTemplate[] } | null = null;
let pending: Promise<PublishedTemplate[]> | null = null;

/** Deduplicates browser template reads and reuses the public catalogue for five minutes. */
export function loadPublishedTemplatesClient(): Promise<PublishedTemplate[]> {
  if (cached && cached.expiresAt > Date.now()) {
    log("hit", 0);
    return Promise.resolve(cached.value);
  }
  if (pending) {
    log("in-flight", 0);
    return pending;
  }

  const started = performance.now();
  log("miss", 0);
  pending = (async () => {
    const { data, error } = await createClient()
      .from("templates")
      .select("id, name, slug, category, description, html, css, code")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw error;
    const templates = data ?? [];
    cached = { value: templates, expiresAt: Date.now() + TEMPLATE_CACHE_TTL_MS };
    log("loaded", performance.now() - started);
    return templates;
  })().finally(() => {
    pending = null;
  });
  return pending;
}

export function invalidatePublishedTemplatesClient(): void {
  cached = null;
}

function log(result: "hit" | "miss" | "in-flight" | "loaded", durationMs: number): void {
  if (process.env.NODE_ENV !== "development") return;
  console.info(`[data-cache] templates ${result}${durationMs ? ` ${durationMs.toFixed(0)}ms` : ""}`);
}
