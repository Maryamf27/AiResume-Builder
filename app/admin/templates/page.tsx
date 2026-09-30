import type { Metadata } from "next";
import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import Button from "@/components/ui/button";
import { requireAdmin } from "@/lib/admin/require-admin";
import { deleteTemplateAction, setPublishedAction } from "@/app/admin/templates/actions";

export const metadata: Metadata = { title: "Templates · Admin" };

export default async function AdminTemplatesPage() {
  const { supabase } = await requireAdmin();
  const { data: usageRows } = await supabase.rpc("admin_template_usage");
  const usage = new Map((usageRows ?? []).map((u) => [u.template_id, u]));

  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, name, slug, category, is_published, sort_order, updated_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Templates</h1>
          <p className="mt-1 text-sm text-charcoal/65">
            {templates?.length ?? 0} total · {templates?.filter((t) => t.is_published).length ?? 0} published.
            Users only see published templates.
          </p>
        </div>
        <Link href="/admin/templates/new" className={buttonClassName({})}>
          New template
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-destructive">
          Could not load templates: {error.message}
        </p>
      )}

      {templates && templates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cream-dark bg-cream-light p-10 text-center text-sm text-charcoal/65">
          No templates yet. Create the first one to get started.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-cream-dark bg-cream-light">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-cream-dark text-xs uppercase tracking-wide text-charcoal/55">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-medium">Selected</th>
                <th className="whitespace-nowrap px-4 py-3 text-center font-medium">Downloads</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates?.map((t) => (
                <tr key={t.id} className="border-b border-cream-dark/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-charcoal">{t.name}</div>
                    <div className="text-xs text-charcoal/50">{t.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-charcoal/70">{t.sort_order}</td>
                  <td className="px-4 py-3 text-charcoal/70">{t.category ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        t.is_published
                          ? "rounded-full bg-olive/15 px-2 py-0.5 text-xs font-medium text-olive"
                          : "rounded-full bg-cream-dark px-2 py-0.5 text-xs font-medium text-charcoal/65"
                      }
                    >
                      {t.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-charcoal/80">
                    {usage.get(t.id)?.selected_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-charcoal/80">
                    {usage.get(t.id)?.downloaded_count ?? 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-charcoal/60">
                    {new Date(t.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="-mr-3 flex items-center justify-end gap-1">
                      <Link href={`/admin/templates/${t.id}`} className={buttonClassName({ variant: "outline", size: "sm" })}>
                        Edit
                      </Link>
                      <form action={setPublishedAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="publish" value={String(!t.is_published)} />
                        <Button type="submit" size="sm" variant="ghost">
                          {t.is_published ? "Unpublish" : "Publish"}
                        </Button>
                      </form>
                      <form action={deleteTemplateAction}>
                        <input type="hidden" name="id" value={t.id} />
                        <Button type="submit" size="sm" variant="ghost-destructive">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
