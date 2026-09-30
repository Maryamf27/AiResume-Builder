"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import PasswordInput from "@/components/account/password-input";
import { createClient } from "@/lib/supabase/client";
import { AUTH_ERRORS } from "@/lib/auth/auth-utils";

type Errors = { current?: string; next?: string; confirm?: string };

export default function PasswordForm({ email }: { email: string }) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const current = String(data.get("current") ?? "");
    const next = String(data.get("next") ?? "");
    const confirm = String(data.get("confirm") ?? "");

    setFormError(null);
    setSuccess(false);

    const nextErrors: Errors = {};
    if (!current) nextErrors.current = "Enter your current password.";
    if (!next) nextErrors.next = AUTH_ERRORS.PASSWORD_REQUIRED;
    else if (next.length < 6) nextErrors.next = AUTH_ERRORS.WEAK_PASSWORD;
    else if (next === current) nextErrors.next = "Your new password must be different from the current one.";
    if (next && confirm !== next) nextErrors.confirm = AUTH_ERRORS.PASSWORD_MISMATCH;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const supabase = createClient();

    // Confirm the person at the keyboard knows the current password first.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (verifyError) {
      setSaving(false);
      setErrors({ current: "That current password is incorrect." });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (updateError) {
      const code = (updateError as { code?: string }).code;
      if (code === "same_password") {
        setErrors({ next: "Your new password must be different from the current one." });
      } else if (code === "weak_password") {
        setErrors({ next: AUTH_ERRORS.WEAK_PASSWORD });
      } else {
        setFormError(AUTH_ERRORS.UNEXPECTED);
      }
      return;
    }

    form.reset();
    setErrors({});
    setSuccess(true);
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
      <Field label="Current password" htmlFor="pw-current" error={errors.current}>
        <PasswordInput
          id="pw-current"
          name="current"
          autoComplete="current-password"
          aria-invalid={!!errors.current}
        />
      </Field>
      <Field label="New password" htmlFor="pw-next" error={errors.next} hint="At least 6 characters.">
        <PasswordInput
          id="pw-next"
          name="next"
          autoComplete="new-password"
          aria-invalid={!!errors.next}
        />
      </Field>
      <Field label="Confirm new password" htmlFor="pw-confirm" error={errors.confirm}>
        <PasswordInput
          id="pw-confirm"
          name="confirm"
          autoComplete="new-password"
          aria-invalid={!!errors.confirm}
        />
      </Field>

      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}
      {success && (
        <p role="status" className="text-sm text-olive">
          Password updated. Use it the next time you sign in.
        </p>
      )}

      <div>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Update password
        </Button>
      </div>
    </form>
  );
}

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
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-charcoal/50">{hint}</p>
      ) : null}
    </div>
  );
}
