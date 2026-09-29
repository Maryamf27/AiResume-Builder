import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardWorkspace from "./dashboard-workspace";
import type { ResumeRow } from "@/types/supabase";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const [{ data: profile }, { data: resumes }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle(),
    supabase.from("resumes").select("id, user_id, title, data, created_at, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }),
  ]);
  const name = profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "there";
  return <DashboardWorkspace resumes={(resumes ?? []) as ResumeRow[]} name={name} isAdmin={profile?.role === "admin"} />;
}
