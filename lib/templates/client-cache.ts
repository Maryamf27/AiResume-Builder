import { getQueryClient } from "@/lib/query/query-client";
import { createClient } from "@/lib/supabase/client";
import type { PublishedTemplate } from "@/lib/templates/types";

export const publishedTemplatesKey = ["templates", "published"] as const;
export const publishedTemplateCountKey = ["templates", "published-count"] as const;
const TEMPLATE_STALE_MS = 5 * 60 * 1_000;

async function fetchPublishedTemplates(): Promise<PublishedTemplate[]> {
  const { data, error } = await createClient()
    .from("templates")
    .select("id, name, slug, category, description, html, css, code")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export const publishedTemplatesQueryOptions = {
  queryKey: publishedTemplatesKey,
  queryFn: fetchPublishedTemplates,
  staleTime: TEMPLATE_STALE_MS,
};

export const publishedTemplateCountQueryOptions = {
  queryKey: publishedTemplateCountKey,
  queryFn: async (): Promise<number> => {
    const { count, error } = await createClient()
      .from("templates")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);
    if (error) throw error;
    return count ?? 0;
  },
  staleTime: TEMPLATE_STALE_MS,
};

export function loadPublishedTemplatesClient(): Promise<PublishedTemplate[]> {
  return getQueryClient().fetchQuery(publishedTemplatesQueryOptions);
}

export function invalidatePublishedTemplatesClient(): void {
  void getQueryClient().invalidateQueries({ queryKey: ["templates"] });
}
