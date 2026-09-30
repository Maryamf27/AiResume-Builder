import { redirect } from "next/navigation";
import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import ProfileForm from "@/components/account/profile-form";
import PasswordForm from "@/components/account/password-form";
import { DeleteAccount, SignOutEverywhere } from "@/components/account/account-actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: profile }, { count: resumeCount }] = await Promise.all([
    supabase.from("profiles").select("full_name, created_at").eq("id", user.id).maybeSingle(),
    supabase.from("resumes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const displayName = String(
    profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? ""
  );
  const email = user.email ?? "";

  return (
    <DashboardShell>
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Account</h1>
      <p className="mt-2 text-sm text-charcoal/60">Manage your profile, password and sign-in.</p>

      <div className="mt-8 flex max-w-2xl flex-col gap-6">
        <Section title="Profile">
          <dl className="mb-5 grid gap-4 border-b border-cream-dark/70 pb-5 text-sm sm:grid-cols-3">
            <Detail label="Email" value={email} />
            <Detail label="Member since" value={formatDate(profile?.created_at ?? user.created_at)} />
            <Detail label="Saved resumes" value={String(resumeCount ?? 0)} />
          </dl>
          <ProfileForm userId={user.id} initialName={displayName} />
        </Section>

        <Section title="Change password" description="You'll be asked for your current password to confirm it's you.">
          <PasswordForm email={email} />
        </Section>

        <Section title="Sessions" description="Signed in on a shared or lost device? End every active session at once.">
          <SignOutEverywhere />
        </Section>

        <Section
          title="Delete account"
          description="Permanently removes your account and all of your saved resumes."
          danger
        >
          <DeleteAccount />
        </Section>
      </div>
    </DashboardShell>
  );
}

function Section({
  title,
  description,
  danger = false,
  children,
}: {
  title: string;
  description?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        danger
          ? "rounded-lg border border-destructive/30 bg-cream-light p-6"
          : "rounded-lg border border-cream-dark bg-cream-light p-6"
      }
    >
      <h2 className={danger ? "font-serif text-lg text-destructive" : "font-serif text-lg text-charcoal"}>
        {title}
      </h2>
      {description && <p className="mt-1 text-sm leading-6 text-charcoal/60">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-charcoal/50">{label}</dt>
      <dd className="mt-1 truncate text-charcoal" title={value}>
        {value}
      </dd>
    </div>
  );
}
