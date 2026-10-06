import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import type { GalleryTemplate } from "@/components/templates/template-gallery";
import { createClient } from "@/lib/supabase/server";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { renderTemplateDocument } from "@/lib/templates/render";
import { sampleResume } from "@/lib/templates/sample-data";

type GalleryRow = Pick<Database["public"]["Tables"]["templates"]["Row"],
  "id" | "name" | "slug" | "category" | "description" | "html" | "css">;
type TemplateClient = SupabaseClient<Database>;

async function queryPublishedTemplates(client: TemplateClient, limit?: number): Promise<GalleryRow[]> {
  let query = client
    .from("templates")
    .select("id, name, slug, category, description, html, css")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (limit) query = query.limit(limit + 2);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

const getCachedPublicTemplateRows = unstable_cache(
  async () => queryPublishedTemplates(createPublicServerClient()),
  ["public-published-template-rows-v1"],
  { revalidate: 300, tags: ["published-templates"] },
);

function renderGalleryRows(rows: GalleryRow[], limit?: number): GalleryTemplate[] {
  const items: GalleryTemplate[] = [];
  for (const template of rows) {
    try {
      items.push({
        id: template.id,
        slug: template.slug,
        name: template.name,
        category: template.category,
        description: template.description,
        srcDoc: renderTemplateDocument({ html: template.html, css: template.css }, sampleResume),
      });
    } catch (error) {
      // One broken template must not take the whole catalogue down.
      console.error(`Template "${template.slug}" failed to render:`, error);
    }
  }
  return limit ? items.slice(0, limit) : items;
}

/** Public gallery data uses anon access and is cached independently of auth cookies. */
export async function loadPublicPublishedTemplates(limit?: number): Promise<{
  items: GalleryTemplate[];
  failed: boolean;
}> {
  try {
    const rows = await getCachedPublicTemplateRows();
    return { items: renderGalleryRows(rows, limit), failed: false };
  } catch (error) {
    console.error("Could not load public templates:", error);
    return { items: [], failed: true };
  }
}

/** Signed-in gallery keeps the cookie-aware client for admin RLS compatibility. */
export async function loadPublishedTemplates(limit?: number): Promise<{
  items: GalleryTemplate[];
  failed: boolean;
}> {
  try {
    const rows = await queryPublishedTemplates(await createClient(), limit);
    return { items: renderGalleryRows(rows, limit), failed: false };
  } catch (error) {
    console.error("Could not load templates:", error);
    return { items: [], failed: true };
  }
}
