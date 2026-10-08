import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import CareerAtsResumePicker from "@/components/dashboard/career-ats-resume-picker";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "ATS Analysis", robots: { index: false, follow: false } };

export default async function CareerATSAnalysisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  return <DashboardShell><CareerAtsResumePicker userId={user.id} /></DashboardShell>;
}
