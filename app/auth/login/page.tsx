"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { AUTH_ERRORS, isValidEmail } from "@/lib/auth/auth-utils";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const errors: FieldErrors = {};
    if (!email) {
      errors.email = AUTH_ERRORS.EMAIL_REQUIRED;
    } else if (!isValidEmail(email)) {
      errors.email = AUTH_ERRORS.INVALID_EMAIL;
    }
    if (!password) {
      errors.password = AUTH_ERRORS.PASSWORD_REQUIRED;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const code = (error as { code?: string }).code;
        if (
          code === "invalid_credentials" ||
          error.message.toLowerCase().includes("invalid") ||
          error.message.toLowerCase().includes("password") ||
          error.message.toLowerCase().includes("email")
        ) {
          setFormError(AUTH_ERRORS.INVALID_CREDENTIALS);
        } else if (
          code === "email_not_confirmed"
        ) {
          setFormError(AUTH_ERRORS.UNEXPECTED);
        } else {
          setFormError(AUTH_ERRORS.UNEXPECTED);
        }
        return;
      }

      if (!data.session) {
        setFormError(AUTH_ERRORS.UNEXPECTED);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError(AUTH_ERRORS.UNEXPECTED);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream px-5 sm:px-8">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center justify-center py-16 sm:py-20">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-3xl">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in to continue working on your resumes.
            </CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit} noValidate>
            <CardContent className="space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-charcoal">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="amelia@studioresonance.co"
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "emailError" : undefined}
                />
                {fieldErrors.email && (
                  <p id="emailError" className="text-xs text-destructive">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-charcoal">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Your password"
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "passwordError" : undefined}
                />
                {fieldErrors.password && (
                  <p id="passwordError" className="text-xs text-destructive">
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-center text-sm text-charcoal/70">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-olive hover:text-olive-dark"
                >
                  Create account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
