import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import CareerJobAnalysis, { type CareerResumeOption } from "@/components/dashboard/career-job-analysis";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_RESUME_TITLE } from "@/lib/resume/constants";

export const metadata: Metadata = { title: "Job Analysis", robots: { index: false, follow: false } };

export default async function CareerJobAnalysisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data } = await supabase.from("resumes").select("id, title, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false });
  const resumes: CareerResumeOption[] = (data ?? []).map((resume) => ({ id: resume.id, title: resume.title || DEFAULT_RESUME_TITLE, updatedAt: resume.updated_at }));
  return <DashboardShell><CareerJobAnalysis resumes={resumes} /></DashboardShell>;
}
