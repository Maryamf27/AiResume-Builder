import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";


const loadAdmin = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return { supabase, user: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    supabase,
    user: { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null },
    isAdmin: profile?.role === "admin",
  };
});


export async function requireAdmin() {
  const { supabase, user, isAdmin } = await loadAdmin();
  if (!user) redirect("/auth/login");
  if (!isAdmin) notFound();
  return { supabase, user };
}
