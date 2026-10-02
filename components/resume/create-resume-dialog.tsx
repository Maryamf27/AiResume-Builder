"use client";

import { useState, type ChangeEvent } from "react";
import { ArrowLeft, FilePlus2, Upload } from "lucide-react";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import Dialog from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import { hasGuestResumeToImport } from "@/lib/resume/guest-import";

interface CreateResumeDialogProps {
  open: boolean;
  onClose: () => void;
  hasSavedResume: boolean;
}

export default function CreateResumeDialog({
  open,
  onClose,
  hasSavedResume,
}: CreateResumeDialogProps) {
  const [step, setStep] = useState<"options" | "saved-info" | "upload">("options");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function closeDialog() {
    setStep("options");
    setSelectedFile(null);
    onClose();
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  const isUploadStep = step === "upload";
  const isSavedInfoStep = step === "saved-info";

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      title={
        isUploadStep
          ? "Upload Existing Resume"
          : isSavedInfoStep
            ? "Create with saved info"
            : "Create New Resume"
      }
      description={
        isUploadStep
          ? "PDF, DOC, or DOCX"
          : isSavedInfoStep
            ? "Your saved resume information will load into the builder and its template preview when available. If nothing is saved yet, you can enter it manually."
            : "Choose to work in the resume builder or import an existing resume."
      }
    >
      {isUploadStep ? (
        <div className="mt-6">
          <p className="mb-4 text-sm leading-6 text-charcoal/70">
            Resume import will be available here.
          </p>
          <label
            htmlFor="existing-resume-file"
            className="mb-2 block text-sm font-medium text-charcoal"
          >
            Choose a resume file
          </label>
          <Input
            id="existing-resume-file"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={selectFile}
            className="h-auto min-h-10 py-2 file:mr-3 file:rounded file:border-0 file:bg-olive file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-cream hover:file:bg-olive-dark"
          />
          {selectedFile && (
            <p className="mt-3 break-all text-sm text-charcoal/70" aria-live="polite">
              Selected: {selectedFile.name}
            </p>
          )}
          <div className="mt-6 flex justify-start">
            <Button variant="ghost" onClick={() => setStep("options")}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
          </div>
        </div>
      ) : isSavedInfoStep ? (
        <div className="mt-6 flex flex-col gap-3">
          <ButtonLink
            href="/builder?new=1"
            size="lg"
            onClick={closeDialog}
            className="w-full"
          >
            <FilePlus2 className="h-5 w-5" aria-hidden="true" />
            Create with saved info
          </ButtonLink>
          <Button variant="ghost" onClick={() => setStep("options")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          <ButtonLink
            href="/builder?new=1"
            variant="outline"
            size="lg"
            onClick={(event) => {
              if (hasSavedResume || hasGuestResumeToImport()) {
                event.preventDefault();
                setStep("saved-info");
              } else {
                closeDialog();
              }
            }}
            className="h-auto w-full justify-start whitespace-normal px-4 py-4 text-left"
          >
            <FilePlus2 className="h-5 w-5 shrink-0 text-olive" aria-hidden="true" />
            <span>
              <span className="block font-semibold">Start from Scratch</span>
              <span className="mt-1 block whitespace-normal text-sm font-normal leading-5 text-charcoal/65">
                Build your resume manually using the resume builder.
              </span>
            </span>
          </ButtonLink>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setStep("upload")}
            className="h-auto w-full justify-start whitespace-normal px-4 py-4 text-left"
          >
            <Upload className="h-5 w-5 shrink-0 text-olive" aria-hidden="true" />
            <span>
              <span className="block font-semibold">Upload Existing Resume</span>
              <span className="mt-1 block whitespace-normal text-sm font-normal leading-5 text-charcoal/65">
                Upload an existing PDF or DOCX resume to import and edit it.
              </span>
            </span>
          </Button>
        </div>
      )}
    </Dialog>
  );
}