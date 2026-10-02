"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/button";
import CreateResumeDialog from "@/components/resume/create-resume-dialog";

export default function CreateResumeButton({
  hasSavedResume,
}: {
  hasSavedResume: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="md" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create New Resume
      </Button>
      <CreateResumeDialog
        open={open}
        onClose={() => setOpen(false)}
        hasSavedResume={hasSavedResume}
      />
    </>
  );
}
