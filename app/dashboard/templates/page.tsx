import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import TemplateGallery from "@/components/templates/template-gallery";
import { createClient } from "@/lib/supabase/server";
import { loadPublishedTemplates } from "@/lib/templates/load-gallery";

export const metadata: Metadata = {
  title: "Templates",
  robots: { index: false, follow: false },
};

export default async function DashboardTemplatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { items, failed } = await loadPublishedTemplates();

  return (
    <DashboardShell>
      <div className="w-full min-w-0">
        <Link
          href="/dashboard"
          className="-ml-2 mb-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-charcoal/65 transition-colors hover:bg-cream-dark/50 hover:text-charcoal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </Link>

        <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Templates</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-charcoal/60">
          Preview a design with sample content, then start a new resume with it. You can switch
          templates at any time in the builder without retyping.
        </p>

        <section className="mt-8 w-full min-w-0" aria-label="Available templates">
          {items.length > 0 ? (
            <div className="w-full min-w-0 overflow-x-hidden">
              <TemplateGallery templates={items} compact startNew />
            </div>
          ) : (
            <div
              role={failed ? "alert" : undefined}
              className="rounded-lg border border-dashed border-cream-dark bg-cream-light px-6 py-12 text-center text-sm text-charcoal/65"
            >
              {failed
                ? "Templates could not be loaded. Please refresh in a moment."
                : "No templates are published right now. Check back soon."}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
