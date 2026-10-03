"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ArrowLeft, CheckCircle2, FilePlus2, Loader2, Upload } from "lucide-react";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import Dialog from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { hasGuestResumeToImport } from "@/lib/resume/guest-import";
import { validateResumeFile } from "@/lib/resume/extraction/validation";
import type { ResumeExtractionResult } from "@/lib/resume/extraction/types";

function isResumeExtractionResult(value: unknown): value is ResumeExtractionResult {
  if (typeof value !== "object" || value === null || !("success" in value)) {
    return false;
  }

  if (value.success === true) {
    return (
      "fileName" in value &&
      typeof value.fileName === "string" &&
      "fileType" in value &&
      (value.fileType === "pdf" || value.fileType === "docx") &&
      "text" in value &&
      typeof value.text === "string"
    );
  }

  return (
    value.success === false &&
    "code" in value &&
    typeof value.code === "string" &&
    "message" in value &&
    typeof value.message === "string"
  );
}

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
  const [extracting, setExtracting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<Extract<ResumeExtractionResult, { success: true }> | null>(null);
  const [readyForNextPhase, setReadyForNextPhase] = useState(false);
  const extractionControllerRef = useRef<AbortController | null>(null);

  function resetUploadState() {
    extractionControllerRef.current?.abort();
    extractionControllerRef.current = null;
    setSelectedFile(null);
    setExtracting(false);
    setUploadError(null);
    setExtracted(null);
    setReadyForNextPhase(false);
  }

  function closeDialog() {
    setStep("options");
    resetUploadState();
    onClose();
  }

  function backToOptions() {
    resetUploadState();
    setStep("options");
  }

  async function extractFile(file: File) {
    const controller = new AbortController();
    extractionControllerRef.current = controller;
    setExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      const response = await fetch("/api/resume/extract", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const result: unknown = await response.json().catch(() => null);

      if (!isResumeExtractionResult(result)) {
        throw new Error("The file could not be processed. Please try again.");
      }
      if (!result.success) {
        setUploadError(result.message);
        return;
      }
      if (!response.ok) {
        throw new Error("The file could not be processed. Please try again.");
      }

      setExtracted(result);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      setUploadError(
        error instanceof Error
          ? error.message
          : "We couldn't read this file. Please try again."
      );
    } finally {
      if (extractionControllerRef.current === controller) {
        extractionControllerRef.current = null;
        setExtracting(false);
      }
    }
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;
    input.value = "";
    if (!file) return;

    extractionControllerRef.current?.abort();
    setSelectedFile(file);
    setUploadError(null);
    setExtracted(null);
    setReadyForNextPhase(false);

    const validation = validateResumeFile(file);
    if (!validation.valid) {
      setExtracting(false);
      setUploadError(validation.message);
      return;
    }

    void extractFile(file);
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
          ? "PDF or DOCX"
          : isSavedInfoStep
            ? "Your saved resume information will load into the builder and its template preview when available. If nothing is saved yet, you can enter it manually."
            : "Choose to work in the resume builder or import an existing resume."
      }
    >
      {isUploadStep ? (
        <div className="mt-6">
          {extracted ? (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-olive" role="status">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Resume uploaded successfully
              </div>
              <p className="mt-3 break-all text-sm text-charcoal/70">
                File: <span className="font-medium text-charcoal">{extracted.fileName}</span>
              </p>
              <label
                htmlFor="extracted-resume-text"
                className="mb-2 mt-5 block text-sm font-medium text-charcoal"
              >
                Extracted content
              </label>
              <Textarea
                id="extracted-resume-text"
                value={extracted.text}
                readOnly
                rows={12}
                className="max-h-[45vh] min-h-64 overflow-y-auto font-mono text-xs leading-5"
              />
              {readyForNextPhase && (
                <p className="mt-3 text-sm text-olive" role="status">
                  Extracted text is ready for the next step.
                </p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button onClick={() => setReadyForNextPhase(true)}>
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm leading-6 text-charcoal/70">
                Choose a PDF or DOCX file. Maximum file size: 10 MB.
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
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={selectFile}
                className="h-auto min-h-10 py-2 file:mr-3 file:rounded file:border-0 file:bg-olive file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-cream hover:file:bg-olive-dark"
              />
              {selectedFile && !uploadError && !extracted && (
                <p className="mt-3 break-all text-sm text-charcoal/70">
                  Selected: {selectedFile.name}
                </p>
              )}
              {extracting && (
                <p className="mt-4 flex items-center gap-2 text-sm text-charcoal/70" role="status">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Extracting resume…
                </p>
              )}
              {uploadError && (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {uploadError}
                </p>
              )}
              <div className="mt-6 flex justify-start">
                <Button variant="ghost" onClick={backToOptions} disabled={extracting}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
              </div>
            </>
          )}
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