import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import ResumeList from "@/components/dashboard/resume-list";
import CachedCreateResumeButton from "@/components/dashboard/cached-create-resume-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Resumes",
  robots: { index: false, follow: false },
};

export default async function MyResumesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">My Resumes</h1>
          <p className="mt-2 text-sm text-charcoal/60">Edit, rename, download or delete your saved resumes.</p>
        </div>
        <CachedCreateResumeButton userId={user.id} />
      </div>

      <section className="mt-8">
        <ResumeList userId={user.id} />
      </section>
    </DashboardShell>
  );
}

