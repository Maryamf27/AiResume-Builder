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
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
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
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    const errors: FieldErrors = {};
    if (!fullName) errors.fullName = AUTH_ERRORS.FULL_NAME_REQUIRED;
    if (!email) {
      errors.email = AUTH_ERRORS.EMAIL_REQUIRED;
    } else if (!isValidEmail(email)) {
      errors.email = AUTH_ERRORS.INVALID_EMAIL;
    }
    if (!password) {
      errors.password = AUTH_ERRORS.PASSWORD_REQUIRED;
    } else if (password.length < 6) {
      errors.password = AUTH_ERRORS.WEAK_PASSWORD;
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = AUTH_ERRORS.PASSWORD_MISMATCH;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        const code = (error as { code?: string }).code;
        if (code === "user_already_registered" || code === "email_taken" || error.message.toLowerCase().includes("already registered")) {
          setFormError(AUTH_ERRORS.USER_ALREADY_REGISTERED);
        } else if (code === "weak_password" || error.message.toLowerCase().includes("password")) {
          setFormError(AUTH_ERRORS.WEAK_PASSWORD);
        } else if (code === "invalid_email" || error.message.toLowerCase().includes("invalid email")) {
          setFormError(AUTH_ERRORS.INVALID_EMAIL);
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
              Create your account
            </CardTitle>
            <CardDescription>
              Build, save, and manage your professional resumes.
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
                <label htmlFor="fullName" className="block text-sm font-medium text-charcoal">
                  Full name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Amelia Carter"
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.fullName}
                  aria-describedby={fieldErrors.fullName ? "fullNameError" : undefined}
                />
                {fieldErrors.fullName && (
                  <p id="fullNameError" className="text-xs text-destructive">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>
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
                  autoComplete="new-password"
                  required
                  placeholder="At least 6 characters"
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
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal">
                  Confirm password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter your password"
                  disabled={isSubmitting}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? "confirmPasswordError" : undefined}
                />
                {fieldErrors.confirmPassword && (
                  <p id="confirmPasswordError" className="text-xs text-destructive">
                    {fieldErrors.confirmPassword}
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
              <p className="text-center text-sm text-charcoal/70">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-olive hover:text-olive-dark"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
