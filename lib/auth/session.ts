import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getSessionWithRole() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    isAdmin: profile?.role === "admin",
    fullName: profile?.full_name ?? null,
  };
}
