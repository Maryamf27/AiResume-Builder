import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import ResumeList, { type ResumeListItem } from "@/components/dashboard/resume-list";
import CreateResumeButton from "@/components/dashboard/create-resume-button";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RESUME_TITLE } from "@/lib/resume/constants";
import type { ResumeData } from "@/types/resume";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.fullName ??
    user.email?.split("@")[0] ??
    "there";

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
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">
            Good to see you, {String(displayName)}
          </h1>
          <p className="mt-2 text-sm text-charcoal/60">
            Pick up where you left off, or start something new.
          </p>
        </div>
        <CreateResumeButton userId={user.id} />
      </div>

      <section id="resumes" className="mt-10 scroll-mt-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-charcoal/50">
          My Resumes
        </h2>
        <ResumeList userId={user.id} initialResumes={resumes} />
      </section>
    </DashboardShell>
  );
}
