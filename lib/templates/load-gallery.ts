import type { GalleryTemplate } from "@/components/templates/template-gallery";
import { createClient } from "@/lib/supabase/server";
import { renderTemplateDocument } from "@/lib/templates/render";
import { sampleResume } from "@/lib/templates/sample-data";

/** Published templates rendered with the sample resume. Shared by the public
 *  /templates page and the signed-in /dashboard/templates page. */
export async function loadPublishedTemplates(limit?: number): Promise<{
  items: GalleryTemplate[];
  failed: boolean;
}> {
  try {
    const supabase = await createClient();
    // The explicit filter matters for signed-in admins, whose RLS policy would
    // otherwise also return drafts. Only published templates are ever listed.
    let query = supabase
      .from("templates")
      .select("id, name, slug, category, description, html, css")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    // A little slack so one template that fails to render doesn't leave a gap.
    if (limit) query = query.limit(limit + 2);
    const { data, error } = await query;
    if (error) throw error;

    const items: GalleryTemplate[] = [];
    for (const t of data ?? []) {
      try {
        items.push({
          id: t.id,
          slug: t.slug,
          name: t.name,
          category: t.category,
          description: t.description,
          srcDoc: renderTemplateDocument({ html: t.html, css: t.css }, sampleResume),
        });
      } catch (err) {
        // One broken template must not take the whole catalogue down.
        console.error(`Template "${t.slug}" failed to render:`, err);
      }
    }
    return { items: limit ? items.slice(0, limit) : items, failed: false };
  } catch (err) {
    console.error("Could not load templates:", err);
    return { items: [], failed: true };
  }
}
