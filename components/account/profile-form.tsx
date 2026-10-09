"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { AUTH_ERRORS } from "@/lib/auth/auth-utils";
import { profileKey } from "@/components/dashboard/dashboard-session";

export default function ProfileForm({
  userId,
  initialName,
}: {
  userId: string;
  initialName: string;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const trimmed = name.trim();
  const unchanged = trimmed === initialName.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaved(false);

    if (!trimmed) {
      setError(AUTH_ERRORS.FULL_NAME_REQUIRED);
      return;
    }
    if (trimmed.length > 80) {
      setError("Name must be 80 characters or fewer.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: trimmed })
      .eq("id", userId);
    if (profileError) {
      setSaving(false);
      setError("Couldn't save your name. Please try again.");
      return;
    }
    await supabase.auth.updateUser({ data: { full_name: trimmed } });

    setSaving(false);
    setSaved(true);
    queryClient.setQueryData(profileKey(userId), trimmed);
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor="account-name" className="text-xs font-medium uppercase tracking-wide text-charcoal/50">
          Full name
        </label>
        <Input
          id="account-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          autoComplete="name"
          maxLength={80}
          className="mt-1.5"
          aria-invalid={!!error}
          aria-describedby={error ? "account-name-error" : undefined}
        />
      </div>

      {error && (
        <p id="account-name-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-olive">
          Name updated.
        </p>
      )}

      <div>
        <Button type="submit" disabled={saving || unchanged}>
          {saving && <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}
