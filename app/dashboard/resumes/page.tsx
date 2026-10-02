import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import ResumeList, { type ResumeListItem } from "@/components/dashboard/resume-list";
import CreateResumeButton from "@/components/dashboard/create-resume-button";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RESUME_TITLE } from "@/lib/resume/constants";
import type { ResumeData } from "@/types/resume";

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

  const { data: rows } = await supabase
    .from("resumes")
    .select("id, title, data, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const resumes: ResumeListItem[] = (rows ?? []).map((row) => ({
    id: row.id,
    title: row.title || DEFAULT_RESUME_TITLE,
    data: row.data as unknown as ResumeData,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">My Resumes</h1>
          <p className="mt-2 text-sm text-charcoal/60">
            {resumes.length === 0
              ? "You haven't created a resume yet."
              : `${resumes.length} ${resumes.length === 1 ? "resume" : "resumes"} — edit, rename, download or delete.`}
          </p>
        </div>
        <CreateResumeButton hasSavedResume={resumes.length > 0} />
      </div>

      <section className="mt-8">
        <ResumeList userId={user.id} initialResumes={resumes} />
      </section>
    </DashboardShell>
  );
}
