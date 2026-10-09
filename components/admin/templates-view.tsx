"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import AdminPageSkeleton from "@/components/admin/page-skeleton";
import TemplateActionsMenu from "@/components/admin/template-actions-menu";
import TemplateThumbnail from "@/components/admin/template-thumbnail";
import { buttonClassName } from "@/components/ui/button";
import { adminQueryOptions } from "@/lib/admin/queries";

export default function AdminTemplatesView() {
  const { data, error, isPending } = useQuery(adminQueryOptions.templates);
  if (isPending) return <AdminPageSkeleton />;

  const templates = data?.templates;
  const usage = new Map((data?.usage ?? []).map((u) => [u.template_id, u]));

  return (
    <div className="w-full min-w-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
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
        <div className="rounded-xl border border-dashed border-cream-dark bg-cream-light p-10 text-center text-sm text-charcoal/65">
          No templates yet. Create the first one to get started.
        </div>
      ) : (
        <>
          <ul className="w-full min-w-0 space-y-3 xl:hidden">
            {templates?.map((t) => (
              <li key={t.id} className="w-full min-w-0 rounded-xl border border-cream-dark bg-cream-light p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <TemplateThumbnail name={t.name} thumbnailUrl={t.thumbnail_url} />
                    <h2 className="wrap-break-word min-w-0 flex-1 text-sm font-semibold text-slate-900">{t.name}</h2>
                  </div>
                  <span
                    className={
                      t.is_published
                        ? "shrink-0 rounded-full bg-olive/15 px-2 py-0.5 text-xs font-medium text-olive"
                        : "shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                    }
                  >
                    {t.is_published ? "Published" : "Draft"}
                  </span>
                  <TemplateActionsMenu templateId={t.id} templateName={t.name} isPublished={t.is_published} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-200 pt-3">
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Order</dt>
                    <dd className="mt-0.5 text-sm tabular-nums text-slate-700">{t.sort_order}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Selected</dt>
                    <dd className="mt-0.5 text-sm tabular-nums text-slate-700">{usage.get(t.id)?.selected_count ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Downloads</dt>
                    <dd className="mt-0.5 text-sm tabular-nums text-slate-700">{usage.get(t.id)?.downloaded_count ?? 0}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Updated</dt>
                    <dd className="mt-0.5 text-sm text-slate-700">
                      {new Date(t.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <div className="hidden w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm xl:block">
          <table className="min-w-230 w-full table-fixed text-left text-xs 2xl:text-sm">
            <colgroup>
              <col className="w-[8%]" />
              <col className="w-[24%]" />
              <col className="w-[8%]" />
              <col className="w-[13%]" />
              <col className="w-[11%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-2 py-3 font-medium">Preview</th>
                <th className="px-2 py-3 font-medium">Name</th>
                <th className="hidden px-1 py-3 text-center font-medium sm:table-cell">Order</th>
                <th className="px-2 py-3 font-medium">Status</th>
                <th className="px-1 py-3 text-center font-medium">Selected</th>
                <th className="px-1 py-3 text-center font-medium">Downloads</th>
                <th className="hidden px-2 py-3 font-medium sm:table-cell">Updated</th>
                <th className="px-2 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates?.map((t) => (
                <tr key={t.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-2 py-2.5">
                    <TemplateThumbnail name={t.name} thumbnailUrl={t.thumbnail_url} />
                  </td>
                  <td className="wrap-break-word px-2 py-3 font-medium text-slate-900">
                    {t.name}
                  </td>
                  <td className="hidden px-1 py-3 text-center tabular-nums text-slate-600 sm:table-cell">{t.sort_order}</td>
                  <td className="px-2 py-3">
                    <span
                      className={
                        t.is_published
                          ? "inline-block rounded-full bg-olive/15 px-2 py-0.5 text-[10px] font-medium text-olive 2xl:text-xs"
                          : "inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 2xl:text-xs"
                      }
                    >
                      {t.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-1 py-3 text-center tabular-nums text-slate-700">
                    {usage.get(t.id)?.selected_count ?? 0}
                  </td>
                  <td className="px-1 py-3 text-center tabular-nums text-slate-700">
                    {usage.get(t.id)?.downloaded_count ?? 0}
                  </td>
                  <td className="hidden px-2 py-3 text-slate-500 sm:table-cell">
                    {new Date(t.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-2 py-3 text-right">
                    <TemplateActionsMenu templateId={t.id} templateName={t.name} isPublished={t.is_published} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </div>
  );
}
