import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
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
    user.email?.split("@")[0] ??
    "there";

  return (
    <DashboardShell>
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Account</h1>
      <div className="mt-8 max-w-lg rounded-lg border border-cream-dark bg-cream-light p-6">
        <dl className="flex flex-col gap-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
              Name
            </dt>
            <dd className="mt-1 text-charcoal">{String(displayName)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
              Email
            </dt>
            <dd className="mt-1 text-charcoal">{user.email}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs leading-5 text-charcoal/55">
          To sign out, use the Sign out option in the sidebar.
        </p>
      </div>
    </DashboardShell>
  );
}
