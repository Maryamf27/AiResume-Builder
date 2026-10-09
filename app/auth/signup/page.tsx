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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

    // Client-side validation
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
    if (password && confirmPassword && password !== confirmPassword) {
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
          data: { full_name: fullName },
        },
      });

      if (error) {
        const code = (error as { code?: string }).code;
        if (
          code === "user_already_registered" ||
          code === "email_taken" ||
          error.message.toLowerCase().includes("already registered")
        ) {
          setFormError(AUTH_ERRORS.USER_ALREADY_REGISTERED);
        } else if (
          code === "weak_password" ||
          error.message.toLowerCase().includes("password")
        ) {
          setFormError(AUTH_ERRORS.WEAK_PASSWORD);
        } else if (
          code === "invalid_email" ||
          error.message.toLowerCase().includes("invalid email")
        ) {
          setFormError(AUTH_ERRORS.INVALID_EMAIL);
        } else {
          setFormError(AUTH_ERRORS.UNEXPECTED);
        }
        return;
      }

      // Email confirmation is OFF in Supabase — session is available immediately.
      if (!data.session) {
        setFormError(AUTH_ERRORS.UNEXPECTED);
        return;
      }

      // Take guests straight to the builder so their draft is moved into the account.
      router.push(hasGuestResumeToImport() ? "/builder" : "/dashboard");
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
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-5 sm:px-8">
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
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-charcoal/65">
            Build, save, and manage professional resumes.
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

            {/* Full name */}
            <Field
              label="Full name"
              htmlFor="fullName"
              error={fieldErrors.fullName}
            >
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Amelia Carter"
                disabled={isSubmitting}
                aria-invalid={!!fieldErrors.fullName}
                aria-describedby={
                  fieldErrors.fullName ? "fullNameError" : undefined
                }
              />
            </Field>

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
              hint="At least 6 characters"
            >
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                placeholder="At least 6 characters"
                disabled={isSubmitting}
                show={showPassword}
                onToggle={() => setShowPassword((v) => !v)}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password ? "passwordError" : "passwordHint"
                }
              />
            </Field>

            {/* Confirm password */}
            <Field
              label="Confirm password"
              htmlFor="confirmPassword"
              error={fieldErrors.confirmPassword}
            >
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                disabled={isSubmitting}
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={
                  fieldErrors.confirmPassword
                    ? "confirmPasswordError"
                    : undefined
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
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        {/* Switch to login */}
        <p className="mt-6 text-center text-sm text-charcoal/60">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-olive underline-offset-4 hover:underline"
          >
            Sign in
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
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const errorId = `${htmlFor}Error`;
  const hintId = `${htmlFor}Hint`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-charcoal"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-charcoal/50">
          {hint}
        </p>
      ) : null}
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