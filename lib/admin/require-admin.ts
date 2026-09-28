import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side admin gate. Call it at the top of every admin page AND every
 * admin server action: hiding a link is not access control. Non-admins get a
 * 404 so the admin area is not advertised. (The database enforces the same
 * rule through RLS, so this is a second lock, not the only one.)
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") notFound();
  return { supabase, user };
}
