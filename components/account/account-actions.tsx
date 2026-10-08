"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { clearResumeCache } from "@/lib/resume/client-cache";

const CONFIRM_WORD = "DELETE";

/** Sign out everywhere. */
export function SignOutEverywhere() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error: signOutError } = await createClient().auth.signOut({ scope: "global" });
    if (signOutError) {
      setBusy(false);
      setError("Couldn't sign you out everywhere. Please try again.");
      return;
    }
    clearResumeCache();
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <Button variant="outline" onClick={() => void run()} disabled={busy}>
        {busy && <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Sign out of all devices
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Permanently delete the account, behind a typed confirmation. */
export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    if (busy) return;
    setOpen(false);
    setTyped("");
    setError(null);
  }

  async function confirmDelete() {
    if (busy || typed !== CONFIRM_WORD) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("delete_my_account");
    if (rpcError) {
      setBusy(false);
      setError(
        rpcError.message.includes("Could not find the function")
          ? "Account deletion isn't set up yet. Run migration 0007_delete_account.sql."
          : "Couldn't delete your account. Please try again."
      );
      return;
    }
    await supabase.auth.signOut();
    clearResumeCache();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete my account
      </Button>

      <Dialog
        open={open}
        onClose={close}
        title="Delete your account?"
        description="This permanently deletes your account and every resume you've saved. It can't be undone."
      >
        <label htmlFor="delete-confirm" className="text-sm text-charcoal/75">
          Type <strong className="font-semibold text-charcoal">{CONFIRM_WORD}</strong> to confirm.
        </label>
        <Input
          id="delete-confirm"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          autoFocus
          className="mt-2"
        />
        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => void confirmDelete()}
            disabled={busy || typed !== CONFIRM_WORD}
          >
            {busy && <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Delete account
          </Button>
        </div>
      </Dialog>
    </>
  );
}
