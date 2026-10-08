import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import CareerJobAnalysis from "@/components/dashboard/career-job-analysis";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Job Analysis", robots: { index: false, follow: false } };

export default async function CareerJobAnalysisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  return <DashboardShell><CareerJobAnalysis userId={user.id} /></DashboardShell>;
}
