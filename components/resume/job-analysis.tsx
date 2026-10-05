"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  Tag,
} from "lucide-react";
import Button from "@/components/ui/button";
import ATSScoreCircle from "@/components/resume/ats-score-circle";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";
import TailoringReview from "@/components/resume/tailoring-review";
import { hasResumeContent } from "@/lib/resume/guest-import";
import { buildAIResumeContext } from "@/lib/ai/resume-context";
import type { JobAnalysis, MatchAnalysis, TailoringAnalysis } from "@/lib/ai/schemas";

const MIN_JOB_DESCRIPTION_LENGTH = 80;
const MAX_JOB_DESCRIPTION_LENGTH = 20000;
const MAX_JOB_ANALYSIS_CACHE_ENTRIES = 20;
const jobAnalysisCache = new Map<string, JobAnalysis>();

function cacheJobAnalysis(description: string, analysis: JobAnalysis) {
  jobAnalysisCache.delete(description);
  jobAnalysisCache.set(description, analysis);
  if (jobAnalysisCache.size > MAX_JOB_ANALYSIS_CACHE_ENTRIES) {
    const oldestKey = jobAnalysisCache.keys().next().value;
    if (oldestKey) jobAnalysisCache.delete(oldestKey);
  }
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-olive" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function JobAnalysisPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const { resumeData } = useResumeBuilder();
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null);
  const [matchStatus, setMatchStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [matchError, setMatchError] = useState<string | null>(null);
  const [tailoringAnalysis, setTailoringAnalysis] = useState<TailoringAnalysis | null>(null);
  const [tailoringStatus, setTailoringStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [tailoringError, setTailoringError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [matchAnalysisKey, setMatchAnalysisKey] = useState<string | null>(null);
  const [tailoringAnalysisKey, setTailoringAnalysisKey] = useState<string | null>(null);
  const analysisControllerRef = useRef<AbortController | null>(null);
  const matchControllerRef = useRef<AbortController | null>(null);
  const tailoringControllerRef = useRef<AbortController | null>(null);
  const analysisRequestIdRef = useRef(0);
  const matchRequestIdRef = useRef(0);
  const tailoringRequestIdRef = useRef(0);
  const analysisBusyRef = useRef(false);
  const matchBusyRef = useRef(false);
  const tailoringBusyRef = useRef(false);
  const resumeContext = useMemo(() => buildAIResumeContext(resumeData), [resumeData]);
  const resumeContextKey = useMemo(() => JSON.stringify(resumeContext), [resumeContext]);
  const latestResumeContextKeyRef = useRef(resumeContextKey);

  useEffect(() => () => {
    analysisControllerRef.current?.abort();
    matchControllerRef.current?.abort();
    tailoringControllerRef.current?.abort();
  }, []);
  useEffect(() => {
    latestResumeContextKeyRef.current = resumeContextKey;
  }, [resumeContextKey]);

  const helperText = useMemo(() => {
    if (!jobDescription.trim()) return "Paste a complete job description to extract the role requirements.";
    if (jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH) {
      return `Please provide at least ${MIN_JOB_DESCRIPTION_LENGTH} characters.`;
    }
    return `${jobDescription.trim().length}/${MAX_JOB_DESCRIPTION_LENGTH} characters`;
  }, [jobDescription]);

  const analyzeJob = async (force = false) => {
    const trimmed = jobDescription.trim();

    if (!trimmed) {
      setError("Please paste a job description before analyzing.");
      setStatus("error");
      return;
    }

    if (trimmed.length < MIN_JOB_DESCRIPTION_LENGTH) {
      setError("Please provide a more complete job description.");
      setStatus("error");
      return;
    }

    if (trimmed.length > MAX_JOB_DESCRIPTION_LENGTH) {
      setError("This job description is too long. Please shorten it and try again.");
      setStatus("error");
      return;
    }

    if (analysisBusyRef.current) return;
    if (!force) {
      const cached = jobAnalysisCache.get(trimmed);
      if (cached) {
        setAnalysis(cached);
        setStatus("ready");
        setError(null);
        return;
      }
    }

    analysisBusyRef.current = true;
    const requestId = ++analysisRequestIdRef.current;
    const controller = new AbortController();
    analysisControllerRef.current = controller;
    setStatus("loading");
    setError(null);
    setMatchAnalysis(null);
    setMatchStatus("idle");
    setMatchError(null);
    setTailoringAnalysis(null);
    setTailoringStatus("idle");
    setTailoringError(null);

    try {
      const response = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: trimmed }),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; data?: JobAnalysis; error?: string }
        | null;

      if (!response.ok || !payload || payload.success !== true || !payload.data) {
        throw new Error(payload?.error || "We couldn't safely analyze this job description. Please try again.");
      }

      if (requestId !== analysisRequestIdRef.current || controller.signal.aborted) return;
      cacheJobAnalysis(trimmed, payload.data);
      setAnalysis(payload.data);
      setStatus("ready");
    } catch (caught) {
      if (controller.signal.aborted || (caught instanceof Error && caught.name === "AbortError")) return;
      if (requestId !== analysisRequestIdRef.current) return;
      setAnalysis(null);
      setError(caught instanceof Error ? caught.message : "We couldn't safely analyze this job description. Please try again.");
      setStatus("error");
    } finally {
      if (requestId === analysisRequestIdRef.current) {
        analysisBusyRef.current = false;
        analysisControllerRef.current = null;
      }
    }
  };

  const handleJobDescriptionChange = (value: string) => {
    if (value !== jobDescription) {
      analysisControllerRef.current?.abort();
      analysisRequestIdRef.current += 1;
      analysisBusyRef.current = false;
      matchControllerRef.current?.abort();
      matchRequestIdRef.current += 1;
      matchBusyRef.current = false;
      tailoringControllerRef.current?.abort();
      tailoringRequestIdRef.current += 1;
      tailoringBusyRef.current = false;
      setAnalysis(null);
      setStatus("idle");
      setError(null);
      setMatchAnalysis(null);
      setMatchAnalysisKey(null);
      setMatchStatus("idle");
      setMatchError(null);
      setTailoringAnalysis(null);
      setTailoringAnalysisKey(null);
      setTailoringStatus("idle");
      setTailoringError(null);
      setReviewMode(false);
    }
    setJobDescription(value);
  };

  const analyzeMatch = async (force = false) => {
    if (!analysis) {
      setMatchError("Analyze a job description before matching it with your resume.");
      setMatchStatus("error");
      return;
    }

    if (!hasResumeContent(resumeData)) {
      setMatchError("Add some resume content in the builder before calculating a match.");
      setMatchStatus("error");
      return;
    }

    const resumeKeyAtStart = resumeContextKey;
    const requestKey = JSON.stringify({ resume: resumeContext, job: analysis });
    if (!force && matchAnalysis && matchAnalysisKey === requestKey) {
      setMatchStatus("ready");
      setMatchError(null);
      return;
    }
    if (matchBusyRef.current) return;

    matchBusyRef.current = true;
    const requestId = ++matchRequestIdRef.current;
    const controller = new AbortController();
    matchControllerRef.current = controller;
    setMatchStatus("loading");
    setMatchAnalysis(null);
    setMatchError(null);

    try {
      const response = await fetch("/api/ai/match-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeData, job: analysis }),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; data?: MatchAnalysis; error?: string }
        | null;

      if (!response.ok || !payload || payload.success !== true || !payload.data) {
        throw new Error(payload?.error || "We couldn't safely calculate the match. Please try again.");
      }

      if (
        requestId !== matchRequestIdRef.current ||
        controller.signal.aborted ||
        latestResumeContextKeyRef.current !== resumeKeyAtStart
      ) {
        if (requestId === matchRequestIdRef.current && !controller.signal.aborted) {
          setMatchAnalysis(null);
          setMatchAnalysisKey(null);
          setMatchStatus("idle");
        }
        return;
      }
      setMatchAnalysis(payload.data);
      setMatchAnalysisKey(requestKey);
      setMatchStatus("ready");
    } catch (caught) {
      if (controller.signal.aborted || (caught instanceof Error && caught.name === "AbortError")) return;
      if (requestId !== matchRequestIdRef.current) return;
      setMatchAnalysis(null);
      setMatchError(caught instanceof Error ? caught.message : "We couldn't safely calculate the match. Please try again.");
      setMatchStatus("error");
    } finally {
      if (requestId === matchRequestIdRef.current) {
        matchBusyRef.current = false;
        matchControllerRef.current = null;
      }
    }
  };

  const tailorResume = async (force = false) => {
    if (!analysis || !matchAnalysis) {
      setTailoringError("Analyze the job and calculate its resume match before generating suggestions.");
      setTailoringStatus("error");
      return;
    }
    if (!hasResumeContent(resumeData)) {
      setTailoringError("Add resume content in the builder before generating tailoring suggestions.");
      setTailoringStatus("error");
      return;
    }

    const requestKey = JSON.stringify({ resume: resumeContext, job: analysis, match: matchAnalysis });
    if (!force && tailoringAnalysis && tailoringAnalysisKey === requestKey) {
      setTailoringStatus("ready");
      setTailoringError(null);
      return;
    }
    if (tailoringBusyRef.current) return;

    tailoringBusyRef.current = true;
    const requestId = ++tailoringRequestIdRef.current;
    const controller = new AbortController();
    tailoringControllerRef.current = controller;
    setTailoringStatus("loading");
    setTailoringAnalysis(null);
    setTailoringError(null);
    try {
      const response = await fetch("/api/ai/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: resumeData,
          job: analysis,
          match: matchAnalysis,
        }),
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; data?: TailoringAnalysis; error?: string }
        | null;

      if (!response.ok || !payload || payload.success !== true || !payload.data) {
        throw new Error(payload?.error || "We couldn't safely generate tailoring suggestions. Please try again.");
      }
      if (requestId !== tailoringRequestIdRef.current || controller.signal.aborted) return;
      if (latestResumeContextKeyRef.current !== resumeContextKey) {
        setTailoringAnalysis(null);
        setTailoringAnalysisKey(null);
        setTailoringStatus("idle");
        return;
      }
      setTailoringAnalysis(payload.data);
      setTailoringAnalysisKey(requestKey);
      setTailoringStatus("ready");
    } catch (caught) {
      if (controller.signal.aborted || (caught instanceof Error && caught.name === "AbortError")) return;
      if (requestId !== tailoringRequestIdRef.current) return;
      setTailoringAnalysis(null);
      setTailoringError(caught instanceof Error ? caught.message : "We couldn't safely generate tailoring suggestions. Please try again.");
      setTailoringStatus("error");
    } finally {
      if (requestId === tailoringRequestIdRef.current) {
        tailoringBusyRef.current = false;
        tailoringControllerRef.current = null;
      }
    }
  };

  if (reviewMode && tailoringAnalysis) {
    return (
      <TailoringReview
        analysis={tailoringAnalysis}
        onBack={() => setReviewMode(false)}
        onContinueEditing={onClose}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-8 sm:py-7 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to builder
        </Button>
      </div>

      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Job Insights</p>
        <h1 className="mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">Job Description Analyzer</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-charcoal/65">
          Understand what this employer is looking for before tailoring your resume.
        </p>
      </div>

      {status === "loading" && (
        <section className="rounded-xl border border-cream-dark bg-white px-5 py-10 text-center sm:px-8">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-olive/20 bg-olive/5">
              <Loader2 className="h-6 w-6 animate-spin text-olive" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-charcoal">Analyzing job description...</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-charcoal/65">
              Extracting the role, requirements, and keywords in one structured request.
              You can edit the description below to cancel this analysis.
            </p>
          </div>
        </section>
      )}

      {matchStatus === "loading" && (
        <section className="rounded-xl border border-cream-dark bg-white px-5 py-10 text-center sm:px-8" role="status" aria-live="polite">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-olive/20 bg-olive/5">
              <Loader2 className="h-6 w-6 animate-spin text-olive" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-charcoal">Analyzing your match...</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-charcoal/65">
              Comparing your current resume with the structured job requirements in one request.
            </p>
          </div>
        </section>
      )}

      {tailoringStatus === "loading" && (
        <section className="rounded-xl border border-cream-dark bg-white px-5 py-10 text-center sm:px-8" role="status" aria-live="polite">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-olive/20 bg-olive/5">
              <Loader2 className="h-6 w-6 animate-spin text-olive" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-charcoal">Tailoring your resume...</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-charcoal/65">
              Using the existing job analysis and match to prepare grounded suggestions in one request.
            </p>
          </div>
        </section>
      )}

      {tailoringStatus === "ready" && tailoringAnalysis && (
        <TailoringResults
          analysis={tailoringAnalysis}
          jobTitle={analysis?.jobTitle ?? null}
          matchScore={matchAnalysis?.overallScore ?? null}
          onBack={() => setTailoringStatus("idle")}
          onRegenerate={() => void tailorResume(true)}
          onReview={() => setReviewMode(true)}
        />
      )}

      {tailoringStatus === "error" && tailoringError && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm text-destructive" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{tailoringError}</span>
        </div>
      )}

      {(status === "idle" || status === "error" || status === "loading") && (
        <section className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-charcoal">
            <BriefcaseBusiness className="h-4 w-4 text-olive" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Paste the job description</h2>
          </div>

          <textarea
            value={jobDescription}
            onChange={(event) => handleJobDescriptionChange(event.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-[240px] w-full rounded-xl border border-cream-dark bg-cream-light px-4 py-3 text-sm leading-6 text-charcoal outline-none transition focus:border-olive focus:ring-2 focus:ring-olive/20"
            aria-label="Job description input"
          />

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-charcoal/60">{helperText}</p>
            <Button
              type="button"
              variant="primary"
              disabled={status === "loading"}
              onClick={() => void analyzeJob()}
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              {status === "loading" ? "Analyzing..." : "Analyze Job Description"}
            </Button>
          </div>

          {status === "error" && error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}
        </section>
      )}

      {matchStatus === "ready" && matchAnalysis && analysis && tailoringStatus !== "loading" && tailoringStatus !== "ready" && (
        <MatchResults
          analysis={matchAnalysis}
          jobTitle={analysis.jobTitle}
          onBack={() => setMatchStatus("idle")}
          onAnalyzeAgain={() => void analyzeMatch(true)}
          onTailor={() => void tailorResume()}
        />
      )}

      {matchStatus === "error" && matchError && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm text-destructive" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{matchError}</span>
        </div>
      )}

      {status === "ready" && analysis && matchStatus !== "ready" && (
        <div className="space-y-6">
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              type="button"
              variant="primary"
              disabled={matchStatus === "loading"}
              onClick={() => void analyzeMatch()}
            >
              {matchStatus === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              {matchStatus === "loading" ? "Matching..." : "Match My Resume"}
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              setStatus("idle");
              setMatchStatus("idle");
              setMatchAnalysis(null);
            }}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Edit job description
            </Button>
            <Button type="button" variant="outline" onClick={() => void analyzeJob(true)}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Analyze Again
            </Button>
          </div>

          <section className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4 text-olive" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-charcoal">Job Overview</h2>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-cream-dark bg-cream-light p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Role</p>
                <p className="mt-2 font-semibold text-charcoal">{analysis.jobTitle || "Not specified"}</p>
              </div>
              <div className="rounded-lg border border-cream-dark bg-cream-light p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Company</p>
                <p className="mt-2 font-semibold text-charcoal">{analysis.companyName || "Not specified"}</p>
              </div>
              <div className="rounded-lg border border-cream-dark bg-cream-light p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Location</p>
                <div className="mt-2 flex items-center gap-2 font-semibold text-charcoal">
                  <MapPin className="h-4 w-4 text-olive" aria-hidden="true" />
                  <span>{analysis.location || "Not specified"}</span>
                </div>
              </div>
              <div className="rounded-lg border border-cream-dark bg-cream-light p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Employment</p>
                <p className="mt-2 font-semibold text-charcoal">{analysis.employmentType || "Not specified"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-olive/20 bg-olive/5 p-4 text-sm leading-6 text-charcoal/75">
              {analysis.summary}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {analysis.experienceRequirements.length > 0 && (
              <Card title="Experience Requirements">
                <ul className="space-y-3">
                  {analysis.experienceRequirements.map((item, index) => (
                    <li key={`${item.requirement}-${index}`} className="rounded-lg border border-cream-dark bg-cream-light p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-charcoal">{item.requirement}</p>
                        <span className="rounded-full border border-cream-dark px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/60">
                          {item.importance}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis.educationRequirements.length > 0 && (
              <Card title="Education Requirements">
                <ul className="space-y-3">
                  {analysis.educationRequirements.map((item, index) => (
                    <li key={`${item.requirement}-${index}`} className="rounded-lg border border-cream-dark bg-cream-light p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-charcoal">{item.requirement}</p>
                        <span className="rounded-full border border-cream-dark px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/60">
                          {item.importance}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {analysis.requiredSkills.length > 0 && (
            <Card title="Required Skills">
              <div className="flex flex-wrap gap-2">
                {analysis.requiredSkills.map((item, index) => (
                  <span key={`${item.skill}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-olive/20 bg-olive/5 px-3 py-1.5 text-sm font-medium text-charcoal">
                    <Tag className="h-3.5 w-3.5 text-olive" aria-hidden="true" />
                    {item.skill}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {analysis.preferredSkills.length > 0 && (
            <Card title="Preferred Skills">
              <div className="flex flex-wrap gap-2">
                {analysis.preferredSkills.map((item, index) => (
                  <span key={`${item.skill}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-cream-dark bg-cream-light px-3 py-1.5 text-sm font-medium text-charcoal">
                    <CheckCircle2 className="h-3.5 w-3.5 text-olive" aria-hidden="true" />
                    {item.skill}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {analysis.responsibilities.length > 0 && (
            <Card title="Responsibilities">
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-charcoal/75">
                {analysis.responsibilities.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {analysis.requiredQualifications.length > 0 && (
              <Card title="Required Qualifications">
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-charcoal/75">
                  {analysis.requiredQualifications.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </Card>
            )}

            {analysis.preferredQualifications.length > 0 && (
              <Card title="Preferred Qualifications">
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-charcoal/75">
                  {analysis.preferredQualifications.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {analysis.keywords.length > 0 && (
            <Card title="Keywords">
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((keyword, index) => (
                  <span key={`${keyword}-${index}`} className="rounded-full border border-olive/20 bg-olive/5 px-2.5 py-1 text-sm text-charcoal">
                    {keyword}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {analysis.softSkills.length > 0 && (
            <Card title="Soft Skills">
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-charcoal/75">
                {analysis.softSkills.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </Card>
          )}

          {analysis.toolsAndTechnologies.length > 0 && (
            <Card title="Tools & Technologies">
              <div className="flex flex-wrap gap-2">
                {analysis.toolsAndTechnologies.map((item, index) => (
                  <span key={`${item}-${index}`} className="rounded-full border border-cream-dark bg-cream-light px-2.5 py-1 text-sm text-charcoal">
                    {item}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {analysis.certifications.length > 0 && (
            <Card title="Certifications">
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-charcoal/75">
                {analysis.certifications.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}

function MatchResults({
  analysis,
  jobTitle,
  onBack,
  onAnalyzeAgain,
  onTailor,
}: {
  analysis: MatchAnalysis;
  jobTitle: string | null;
  onBack: () => void;
  onAnalyzeAgain: () => void;
  onTailor: () => void;
}) {
  const statusLabels: Record<MatchAnalysis["status"], string> = {
    excellent: "Excellent Match",
    good: "Good Match",
    moderate: "Moderate Match",
    weak: "Weak Match",
  };
  const categories: Array<{ id: keyof MatchAnalysis["categoryScores"]; label: string }> = [
    { id: "skills", label: "Skills Match" },
    { id: "experience", label: "Experience Match" },
    { id: "keywords", label: "Keyword Match" },
    { id: "education", label: "Education Match" },
    { id: "responsibilities", label: "Responsibilities Match" },
    { id: "qualifications", label: "Qualifications Match" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" variant="primary" onClick={onTailor}>
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Improve My Resume
        </Button>
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to job analysis
        </Button>
        <Button type="button" variant="outline" onClick={onAnalyzeAgain}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Analyze Again
        </Button>
      </div>

      <section className="rounded-xl border border-cream-dark bg-white px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Resume ↔ Job Match</p>
          {jobTitle && <p className="mt-2 text-sm font-medium text-charcoal/65">{jobTitle}</p>}
          <div className="mt-3 w-full max-w-[13rem]">
            <ATSScoreCircle
              score={analysis.overallScore}
              size={208}
              status={statusLabels[analysis.status]}
              scoreLabel="Job match"
            />
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-charcoal/70 sm:text-base">{analysis.summary}</p>
        </div>
      </section>

      <Card title="Match Breakdown">
        <div className="space-y-4">
          {categories.map(({ id, label }) => {
            const score = analysis.categoryScores[id];
            return (
              <div key={id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[minmax(9rem,1fr)_2fr_auto]">
                <p className="truncate text-sm font-medium text-charcoal">{label}</p>
                <div
                  role="progressbar"
                  aria-label={label}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={score}
                  className="col-span-2 h-2 overflow-hidden rounded-full bg-cream-dark sm:col-span-1"
                >
                  <div className="h-full rounded-full bg-olive transition-[width] duration-700" style={{ width: `${score}%` }} />
                </div>
                <span className="min-w-10 text-right text-sm font-semibold tabular-nums text-charcoal">{score}%</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Matched Skills">
          {analysis.matchedSkills.length > 0 ? (
            <ul className="space-y-3">
              {analysis.matchedSkills.map((item, index) => (
                <li key={`${item.skill}-${index}`} className="rounded-lg border border-olive/20 bg-olive/5 p-3">
                  <p className="flex items-center gap-2 font-medium text-charcoal">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-olive" aria-hidden="true" />
                    {item.skill}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-charcoal/60">Job requirement: {item.jobRequirement}</p>
                  <p className="mt-1 text-sm leading-5 text-charcoal/75">Resume evidence: {item.resumeEvidence}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-charcoal/65">No clear skill matches were identified.</p>
          )}
        </Card>

        <Card title="Missing Skills">
          {analysis.missingSkills.length > 0 ? (
            <ul className="space-y-3">
              {analysis.missingSkills.map((item, index) => (
                <li key={`${item.skill}-${index}`} className="rounded-lg border border-cream-dark bg-cream-light p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-charcoal">{item.skill}</p>
                    <span className="rounded-full border border-cream-dark px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/60">
                      {item.importance} importance
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-charcoal/70">{item.reason}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-charcoal/65">No missing skills were identified from the supplied resume.</p>
          )}
          <p className="mt-3 text-xs leading-5 text-charcoal/55">
            Missing means not found in the resume; it does not imply you should claim that skill.
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Partial Matches">
          {analysis.partialMatches.length > 0 ? (
            <ul className="space-y-3">
              {analysis.partialMatches.map((item, index) => (
                <li key={`${item.requirement}-${index}`} className="rounded-lg border border-cream-dark bg-cream-light p-3">
                  <p className="font-medium text-charcoal">{item.requirement}</p>
                  <p className="mt-1 text-sm leading-5 text-charcoal/70">{item.explanation}</p>
                  {item.resumeEvidence && <p className="mt-2 text-xs leading-5 text-charcoal/60">Resume evidence: {item.resumeEvidence}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-charcoal/65">No partial matches were identified.</p>
          )}
        </Card>

        <Card title="Keyword Match">
          <div>
            <p className="mb-2 text-sm font-medium text-charcoal">Matched</p>
            {analysis.matchedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-olive/20 bg-olive/5 px-2.5 py-1 text-sm text-charcoal">{keyword}</span>
                ))}
              </div>
            ) : <p className="text-sm text-charcoal/60">No matched keywords.</p>}
          </div>
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-charcoal">Not found</p>
            {analysis.missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-cream-dark bg-cream-light px-2.5 py-1 text-sm text-charcoal">{keyword}</span>
                ))}
              </div>
            ) : <p className="text-sm text-charcoal/60">No missing keywords identified.</p>}
          </div>
        </Card>
      </div>

      <Card title="Responsibility Match">
        {analysis.responsibilityMatches.length > 0 ? (
          <ul className="space-y-3">
            {analysis.responsibilityMatches.map((item, index) => (
              <li key={`${item.responsibility}-${index}`} className="rounded-lg border border-cream-dark bg-cream-light p-3">
                <p className="flex items-center gap-2 font-medium text-charcoal">
                  {item.matched ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-olive" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                  )}
                  {item.responsibility}
                </p>
                <p className="mt-1 text-sm leading-5 text-charcoal/70">{item.explanation}</p>
                {item.resumeEvidence && <p className="mt-2 text-xs leading-5 text-charcoal/60">Resume evidence: {item.resumeEvidence}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-charcoal/65">No responsibilities were available to compare.</p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Strengths">
          {analysis.strengths.length > 0 ? (
            <ul className="space-y-3">
              {analysis.strengths.map((item, index) => (
                <li key={`${item.title}-${index}`} className="rounded-lg border border-olive/20 bg-olive/5 p-3">
                  <p className="font-medium text-charcoal">{item.title}</p>
                  <p className="mt-1 text-sm leading-5 text-charcoal/70">{item.explanation}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-charcoal/65">No specific strengths were identified.</p>}
        </Card>
        <Card title="Gaps">
          {analysis.gaps.length > 0 ? (
            <ul className="space-y-3">
              {analysis.gaps.map((item, index) => (
                <li key={`${item.title}-${index}`} className="rounded-lg border border-cream-dark bg-cream-light p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-charcoal">{item.title}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-charcoal/60">{item.importance} · {item.category}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-charcoal/70">{item.explanation}</p>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-charcoal/65">No major gaps were identified.</p>}
        </Card>
      </div>

      <Card title="Recommendations">
        {analysis.recommendations.length > 0 ? (
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-charcoal/75">
            {analysis.recommendations.map((item, index) => (
              <li key={`${item.title}-${index}`}>
                <span className="font-medium text-charcoal">{item.title}.</span> {item.explanation}
              </li>
            ))}
          </ol>
        ) : <p className="text-sm text-charcoal/65">No recommendations were generated.</p>}
      </Card>
    </div>
  );
}

function TailoringResults({
  analysis,
  jobTitle,
  matchScore,
  onBack,
  onRegenerate,
  onReview,
}: {
  analysis: TailoringAnalysis;
  jobTitle: string | null;
  matchScore: number | null;
  onBack: () => void;
  onRegenerate: () => void;
  onReview: () => void;
}) {
  const filters = ["all", "summary", "experience", "projects", "skills", "keywords", "other"] as const;
  type Filter = (typeof filters)[number];
  const [filter, setFilter] = useState<Filter>("all");
  const [openSuggestion, setOpenSuggestion] = useState<string | null>(null);
  const sectionLabels: Record<TailoringAnalysis["changes"][number]["section"], string> = {
    summary: "Summary",
    experience: "Experience",
    projects: "Projects",
    education: "Education",
  };
  const suggestions = [
    ...analysis.changes.map((change, index) => ({
      id: `change:${index}:${change.id}`,
      category: change.section === "education" ? "other" as const : change.section,
      label: sectionLabels[change.section],
      title:
        change.section === "summary"
          ? "Make your summary more relevant"
          : change.section === "experience"
            ? "Highlight relevant experience"
            : change.section === "projects"
              ? "Strengthen a relevant project"
              : "Clarify relevant education",
      preview: change.reason,
      priority: change.priority,
      change,
      detail: change.reason,
    })),
    ...analysis.skillsSuggestions.map((suggestion, index) => ({
      id: `skill:${index}`,
      category: "skills" as const,
      label: "Skills",
      title: suggestion.action === "consider_if_true" ? `Review ${suggestion.skill}` : `Emphasize ${suggestion.skill}`,
      preview: suggestion.action === "consider_if_true"
        ? "This job requirement isn't confirmed in the resume."
        : "A relevant skill is already supported by your resume.",
      priority: suggestion.action === "consider_if_true" ? "medium" as const : "low" as const,
      change: null,
      detail: suggestion.explanation,
    })),
    ...analysis.keywordSuggestions.map((suggestion, index) => ({
      id: `keyword:${index}`,
      category: "keywords" as const,
      label: "Keywords",
      title: `${suggestion.keyword} · ${suggestion.status.replaceAll("_", " ")}`,
      preview: suggestion.recommendation,
      priority: suggestion.status === "related" ? "medium" as const : "low" as const,
      change: null,
      detail: suggestion.recommendation,
    })),
    ...analysis.otherSuggestions.map((suggestion, index) => ({
      id: `other:${index}`,
      category: "other" as const,
      label: suggestion.section,
      title: suggestion.title,
      preview: suggestion.explanation,
      priority: suggestion.priority,
      change: null,
      detail: suggestion.explanation,
    })),
  ];
  const visibleSuggestions = suggestions.filter(
    (suggestion) => filter === "all" || suggestion.category === filter
  );
  const counts = suggestions.reduce(
    (result, change) => {
      result[change.priority] += 1;
      return result;
    },
    { high: 0, medium: 0, low: 0 }
  );
  const matchLabel = matchScore === null
    ? "Job Match"
    : matchScore >= 90
      ? "Excellent Match"
      : matchScore >= 75
        ? "Good Match"
        : matchScore >= 60
          ? "Moderate Match"
          : "Weak Match";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Match
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onRegenerate}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Regenerate Suggestions
        </Button>
      </div>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">AI Resume Improvements</p>
        <h1 className="mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">Make your resume stronger for this job</h1>
        <p className="mt-2 text-sm leading-6 text-charcoal/65">
          Review concise suggestions based on your existing experience. Nothing is applied automatically.
        </p>
      </header>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="min-w-0 self-start rounded-xl border border-cream-dark bg-white p-4 lg:sticky lg:top-5">
          <div className="flex items-center gap-4 lg:flex-col lg:gap-2 lg:text-center">
            {matchScore !== null && (
              <div className="w-24 shrink-0 sm:w-28 lg:w-full lg:max-w-36">
                <ATSScoreCircle score={matchScore} size={144} status={matchLabel} scoreLabel="Job match" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-charcoal">{jobTitle || "Target job"}</p>
              <p className="mt-1 text-xs text-charcoal/60">
                {suggestions.length} improvement{suggestions.length === 1 ? "" : "s"}
              </p>
              <p className="mt-2 text-xs text-charcoal/60">
                {counts.high} high · {counts.medium} medium · {counts.low} low
              </p>
            </div>
          </div>

          <nav aria-label="Improvement categories" className="mt-4 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-current={filter === item ? "true" : undefined}
                className={`shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium capitalize transition-colors ${
                  filter === item ? "bg-olive text-cream" : "text-charcoal/70 hover:bg-cream-light"
                }`}
              >
                {item === "all" ? `All improvements (${suggestions.length})` : item}
              </button>
            ))}
          </nav>
          <p className="mt-4 hidden border-t border-cream-dark pt-3 text-xs leading-5 text-charcoal/55 lg:block">
            Suggestions are for review only and never change your resume.
          </p>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="rounded-xl border border-cream-dark bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-charcoal">Improvement overview</p>
                <p className="mt-1 text-sm text-charcoal/65">
                  {suggestions.length} suggestion{suggestions.length === 1 ? "" : "s"} · {analysis.overview.estimatedImpact} potential impact
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-cream-dark px-2.5 py-1">{counts.high} high</span>
                <span className="rounded-full border border-cream-dark px-2.5 py-1">{counts.medium} medium</span>
                <span className="rounded-full border border-cream-dark px-2.5 py-1">{counts.low} low</span>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm leading-5 text-charcoal/70">{analysis.overview.summary}</p>
          </div>

          {visibleSuggestions.length === 0 ? (
            <div className="rounded-xl border border-cream-dark bg-white px-5 py-10 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-olive" aria-hidden="true" />
              <h2 className="mt-3 font-semibold text-charcoal">
                {suggestions.length === 0 ? "Your resume is already well aligned" : "No improvements in this category"}
              </h2>
              <p className="mt-1 text-sm text-charcoal/65">
                {suggestions.length === 0
                  ? "No major improvements were found for this job."
                  : "Choose another category to explore suggestions."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleSuggestions.map((suggestion) => {
                const isOpen = openSuggestion === suggestion.id;
                return (
                  <li key={suggestion.id} className="overflow-hidden rounded-xl border border-cream-dark bg-white">
                    <div className="flex min-w-0 items-start gap-3 p-4">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-olive" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/55">{suggestion.label}</span>
                          <span className="rounded-full border border-cream-dark px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/60">{suggestion.priority}</span>
                        </div>
                        <h2 className="mt-1 font-semibold text-charcoal">{suggestion.title}</h2>
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-charcoal/65">{suggestion.preview}</p>
                      </div>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenSuggestion(isOpen ? null : suggestion.id)}
                        className="shrink-0 rounded-md px-2 py-1.5 text-sm font-medium text-olive-dark hover:bg-olive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
                      >
                        {isOpen ? "Close" : "View"}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-cream-dark bg-cream-light/60 p-4 sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/55">Why improve?</p>
                        <p className="mt-1 text-sm leading-5 text-charcoal/75">{suggestion.detail}</p>
                        {suggestion.change && (
                          <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
                            <div className="min-w-0 rounded-lg border border-cream-dark bg-white p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/55">Current</p>
                              <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-5 text-charcoal/75">
                                {suggestion.change.currentValue || "No summary currently included"}
                              </p>
                            </div>
                            <div className="min-w-0 rounded-lg border border-olive/20 bg-olive/5 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-olive-dark">AI Suggestion · Not applied</p>
                              <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-5 text-charcoal">
                                {suggestion.change.suggestedValue}
                              </p>
                            </div>
                          </div>
                        )}
                        <p className="mt-3 text-xs text-charcoal/60">
                          {suggestion.change?.supportedByResume
                            ? "Supported by information already in your resume."
                            : "Review carefully and include claims only if they are accurate."}
                        </p>
                        {suggestion.change && (
                          <p className="mt-3 text-right text-xs text-charcoal/55">
                            This suggestion remains unapplied until you choose it in the review step.
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {analysis.changes.length > 0 && (
            <section className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-olive/20 bg-cream-light/95 p-4 shadow-lg backdrop-blur">
              <p className="text-sm text-charcoal/70">
                {analysis.changes.length} proposed resume change{analysis.changes.length === 1 ? "" : "s"} · nothing applied yet
              </p>
              <Button type="button" variant="primary" onClick={onReview}>
                Review Changes
              </Button>
            </section>
          )}

          {analysis.warnings.length > 0 && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h2 className="font-semibold text-amber-900">Important notes</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-5 text-amber-900/80">
                {analysis.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
              </ul>
            </section>
          )}
        </section>
      </div>
    </div>
  );
}
