"use client";

import { useRouter } from "next/navigation";
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
import type { ResumeData } from "@/types/resume";
import { savePendingImportedResume } from "@/lib/resume/storage";

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
  const router = useRouter();
  const [step, setStep] = useState<"options" | "saved-info" | "upload">("options");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<Extract<ResumeExtractionResult, { success: true }> | null>(null);
  const [parsedResume, setParsedResume] = useState<ResumeData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const extractionControllerRef = useRef<AbortController | null>(null);

  function resetUploadState() {
    extractionControllerRef.current?.abort();
    extractionControllerRef.current = null;
    setSelectedFile(null);
    setExtracting(false);
    setUploadError(null);
    setExtracted(null);
    setParsedResume(null);
    setAnalyzing(false);
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

  async function handleAnalyzeResume() {
    if (!extracted) return;
    setAnalyzing(true);
    setUploadError(null);

    try {
      const response = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extracted.text }),
      });

      const result: unknown = await response.json().catch(() => null);
      if (!result || typeof result !== "object" || !("success" in result)) {
        throw new Error("We couldn't parse this resume. Please try again or enter your information manually.");
      }

      if (result.success !== true || !("data" in result) || !result.data || typeof result.data !== "object") {
        throw new Error(
          result && typeof result === "object" && "error" in result && typeof result.error === "string"
            ? result.error
            : "We couldn't parse this resume. Please try again or enter your information manually."
        );
      }

      setParsedResume(result.data as ResumeData);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "We couldn't automatically import this resume. Please try again or enter your information manually."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function handleApplyImport() {
    if (!parsedResume) return;

    const saved = savePendingImportedResume(parsedResume);
    if (!saved) {
      setUploadError("We couldn't save the imported resume for the builder. Please try again.");
      return;
    }

    closeDialog();
    router.push("/builder?new=1");
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
    setParsedResume(null);

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
          {parsedResume ? (
            <>
              <div className="flex items-center gap-2 text-sm font-medium text-olive" role="status">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Resume imported successfully
              </div>
              <p className="mt-3 text-sm text-charcoal/70">
                AI extracted the following information from your resume.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded border border-olive/20 bg-olive/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/60">
                    Personal Information
                  </p>
                  <p className="mt-1 text-sm text-charcoal">
                    {[parsedResume.personal.firstName, parsedResume.personal.lastName, parsedResume.personal.title]
                      .filter(Boolean)
                      .join(" ") || "No personal details found"}
                  </p>
                  {parsedResume.personal.email && (
                    <p className="mt-1 text-sm text-charcoal/70">{parsedResume.personal.email}</p>
                  )}
                </div>

                {[
                  { label: "Experience", value: `${parsedResume.experience.length} item(s)` },
                  { label: "Education", value: `${parsedResume.education.length} item(s)` },
                  { label: "Skills", value: `${parsedResume.skills.length} item(s)` },
                  { label: "Projects", value: `${parsedResume.projects.length} item(s)` },
                  { label: "Certifications", value: `${parsedResume.certifications.length} item(s)` },
                  { label: "Languages", value: `${parsedResume.languages.length} item(s)` },
                ].map((section) => (
                  <div key={section.label} className="rounded border border-charcoal/10 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/60">
                      {section.label}
                    </p>
                    <p className="mt-1 text-sm text-charcoal">{section.value}</p>
                  </div>
                ))}
                {parsedResume.summary && (
                  <details className="rounded border border-charcoal/10 bg-white p-3 sm:col-span-2">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-charcoal/60">
                      Summary preview
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-5 text-charcoal">
                      {parsedResume.summary}
                    </p>
                  </details>
                )}
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setParsedResume(null)} className="w-full sm:w-auto">
                  Back
                </Button>
                <Button variant="outline" onClick={closeDialog} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleApplyImport} className="w-full sm:w-auto">Apply to Resume</Button>
              </div>
            </>
          ) : extracted ? (
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
              {analyzing && (
                <p className="mt-3 flex items-center gap-2 text-sm text-charcoal/70" role="status">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  AI Analyzing your resume...
                </p>
              )}
              {uploadError && (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {uploadError}
                </p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
                <Button onClick={() => void handleAnalyzeResume()} disabled={analyzing}>
                  {analyzing ? "Analyzing..." : "Continue"}
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