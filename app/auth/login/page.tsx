"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { hasGuestResumeToImport } from "@/lib/resume/guest-import";
import { AUTH_ERRORS, isValidEmail } from "@/lib/auth/auth-utils";
import { cn } from "@/lib/utils";

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    // Client-side validation
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
          error.message.toLowerCase().includes("credentials")
        ) {
          setFormError(AUTH_ERRORS.INVALID_CREDENTIALS);
        } else {
          setFormError(AUTH_ERRORS.UNEXPECTED);
        }
        return;
      }

      if (!data.session) {
        setFormError(AUTH_ERRORS.UNEXPECTED);
        return;
      }

      // Take guests straight to the builder so their draft is moved into the account.
      // Admins land in the Admin Panel; everyone else in their dashboard.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();
      if (profile?.role === "admin") {
        router.push("/admin");
      } else {
        router.push(hasGuestResumeToImport() ? "/builder" : "/dashboard");
      }
      router.refresh();
    } catch {
      setFormError(AUTH_ERRORS.UNEXPECTED);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Minimal nav */}
      <header className="border-b border-cream-dark/60 bg-cream/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-md bg-olive text-cream"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <span className="font-serif text-base tracking-tight text-charcoal">
              Resonance
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col px-5 py-14 sm:px-8 sm:py-20">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl tracking-tight text-charcoal sm:text-4xl">
            Welcome back
          </h1>
          <p className="mt-2 text-sm leading-6 text-charcoal/65">
            Sign in to continue working on your resumes.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-cream-dark bg-cream-light p-6 sm:p-8">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            {/* Global error */}
            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {formError}
              </div>
            )}

            {/* Email */}
            <Field label="Email" htmlFor="email" error={fieldErrors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="amelia@studioresonance.co"
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={
                  fieldErrors.email ? "emailError" : undefined
                }
              />
            </Field>

            {/* Password */}
            <Field
              label="Password"
              htmlFor="password"
              error={fieldErrors.password}
            >
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                disabled={isSubmitting}
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "passwordError" : undefined
                }
              />
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-olive px-6 text-sm font-medium text-cream",
                "transition-colors hover:bg-olive-dark",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light",
                "disabled:cursor-not-allowed disabled:opacity-60"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        {/* Switch to signup */}
        <p className="mt-6 text-center text-sm text-charcoal/60">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-olive underline-offset-4 hover:underline"
          >
            Create account
          </Link>
        </p>
      </main>
    </div>
  );
}

/* ───────── helpers ───────── */

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  const errorId = `${htmlFor}Error`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-charcoal"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordInput({
  show,
  onToggle,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} className="pr-10" {...props} />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70 focus-visible:outline-none"
      >
        {show ? (
          <EyeOff className="h-4 w-4" strokeWidth={2} />
        ) : (
          <Eye className="h-4 w-4" strokeWidth={2} />
        )}
      </button>
    </div>
  );
}