"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import Button from "@/components/ui/button";
import { createResume } from "@/lib/resume/resumes";

export default function CreateResumeButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    setError(null);
    const result = await createResume(userId);
    if (!result.ok) {
      setCreating(false);
      setError("Couldn't create a new resume. Please try again.");
      return;
    }
    router.push(`/builder?id=${result.id}`);
  }

  return (
    <span className="flex flex-col items-start gap-1">
      <Button onClick={() => void handleCreate()} disabled={creating}>
        {creating ? (
          <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
        )}
        Create New Resume
      </Button>
      {error && (
        <span className="text-xs text-destructive" role="alert">{error}</span>
      )}
    </span>
  );
}
