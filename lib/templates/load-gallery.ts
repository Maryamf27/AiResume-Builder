import type { GalleryTemplate } from "@/components/templates/template-gallery";
import { createClient } from "@/lib/supabase/server";
import { renderTemplateDocument } from "@/lib/templates/render";
import { sampleResume } from "@/lib/templates/sample-data";

/** Published templates rendered with the sample resume. Shared by the public
 *  /templates page and the signed-in /dashboard/templates page. */
export async function loadPublishedTemplates(): Promise<{
  items: GalleryTemplate[];
  failed: boolean;
}> {
  try {
    const supabase = await createClient();
    // The explicit filter matters for signed-in admins, whose RLS policy would
    // otherwise also return drafts. Only published templates are ever listed.
    const { data, error } = await supabase
      .from("templates")
      .select("id, name, slug, category, description, html, css")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
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
    return { items, failed: false };
  } catch (err) {
    console.error("Could not load templates:", err);
    return { items: [], failed: true };
  }
}
