import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PublicAuthInfo =
  | { authenticated: false }
  | {
      authenticated: true;
      dashboardHref: string;
      isAdmin: boolean;
      fullName: string | null;
      email: string | null;
    };

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

export async function getOptionalAuthInfo(): Promise<PublicAuthInfo> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authenticated: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";

  return {
    authenticated: true,
    dashboardHref: isAdmin ? "/admin" : "/dashboard",
    isAdmin,
    fullName: profile?.full_name ?? null,
    email: user.email ?? null,
  };
}
