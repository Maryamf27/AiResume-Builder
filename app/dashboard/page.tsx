import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

async function signOutAction() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const fullName =
    user.user_metadata?.full_name ??
    user.user_metadata?.fullName ??
    user.email?.split("@")[0] ??
    "there";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.full_name ?? (fullName as string);

  return (
    <main className="min-h-screen bg-cream px-5 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-start justify-center py-16 sm:py-20">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-serif text-3xl">
              Welcome, {String(displayName)}
            </CardTitle>
            <CardDescription>
              You&apos;re signed in successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-charcoal/70">
              Your account is ready. Resume creation, templates, and live preview
              are coming next.
            </p>
          </CardContent>
          <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-end">
            <form action={signOutAction}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
