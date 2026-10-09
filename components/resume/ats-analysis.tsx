"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Tag,
} from "lucide-react";
import Button from "@/components/ui/button";
import ATSScoreCircle from "@/components/resume/ats-score-circle";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";
import { hasResumeContent } from "@/lib/resume/guest-import";
import { buildATSResumeContext } from "@/lib/ai/ats-context";
import { cn } from "@/lib/utils";
import Input from "@/components/ui/input";
import Dialog from "@/components/ui/dialog";
import { ATSImprovementPlanSchema, type ATSImprovementPlan } from "@/lib/ai/schemas";
import type { ResumeData } from "@/types/resume";

export interface ATSCategory {
  id: string;
  name: string;
  score: number;
  status: "excellent" | "good" | "needs_improvement" | "poor";
  summary: string;
}

export interface ATSStrength {
  title: string;
  explanation: string;
  category: string;
}

export interface ATSIssue {
  id: string;
  severity: "critical" | "warning" | "suggestion";
  category: string;
  title: string;
  explanation: string;
  recommendation: string;
}

export interface ATSKeywordAnalysis {
  detectedKeywords: string[];
  observations: string[];
}

export interface ATSAnalysisData {
  overallScore: number;
  summary: string;
  categories: ATSCategory[];
  strengths: ATSStrength[];
  issues: ATSIssue[];
  keywordAnalysis: ATSKeywordAnalysis;
  nextSteps: string[];
}

type ScoreStatus = "Excellent" | "Good" | "Needs Improvement" | "Poor";

function scoreStatus(score: number): ScoreStatus {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Poor";
}

function statusTone(status: ATSCategory["status"] | ScoreStatus) {
  switch (status) {
    case "excellent":
    case "good":
    case "Excellent":
    case "Good":
      return "text-olive-dark border-olive/25 bg-olive/5";
    case "needs_improvement":
    case "Needs Improvement":
      return "text-amber-700 border-amber-200 bg-amber-50";
    default:
      return "text-destructive border-destructive/20 bg-destructive/5";
  }
}

function categoryScore(score: number): number {
  return Number.isFinite(score) ? Math.min(100, Math.max(0, score)) : 0;
}

function CategoryBreakdown({ categories }: { categories: ATSCategory[] }) {
  return (
    <section
      aria-labelledby="ats-breakdown-heading"
      className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-olive" aria-hidden="true" />
        <h2 id="ats-breakdown-heading" className="text-lg font-semibold text-charcoal">
          ATS Breakdown
        </h2>
      </div>
      <div className="space-y-5">
        {categories.map((category) => {
          const score = categoryScore(category.score);
          return (
            <div key={category.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 sm:grid-cols-[minmax(8rem,1fr)_2fr_auto]">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-charcoal">{category.name}</p>
                <p className="mt-0.5 text-xs text-charcoal/60">{category.summary}</p>
              </div>
              <div
                role="progressbar"
                aria-label={`${category.name} score`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={score}
                className="col-span-2 h-2 overflow-hidden rounded-full bg-cream-dark sm:col-span-1"
              >
                <div
                  className="h-full rounded-full bg-olive transition-[width] duration-700 ease-out"
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="min-w-8 text-right text-sm font-semibold tabular-nums text-charcoal">
                  {category.score}
                </span>
                <span
                  className={cn(
                    "hidden rounded-full border px-2 py-0.5 text-[10px] font-medium sm:inline-block",
                    statusTone(category.status)
                  )}
                >
                  {category.status.replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LoadingDashboard() {
  return (
    <div role="status" aria-live="polite">
      <section className="overflow-hidden rounded-xl border border-cream-dark bg-white">
        <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,1.1fr)_minmax(15rem,0.9fr)] md:items-center md:gap-10 md:p-9">
          <div className="min-w-0">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive/10">
                <Loader2 className="h-5 w-5 animate-spin text-olive" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-olive">Review in progress</p>
                <h2 className="mt-1 text-lg font-semibold text-charcoal sm:text-xl">Analyzing your resume</h2>
                <p className="mt-2 text-sm leading-6 text-charcoal/65">
                  We’re checking how clearly your experience comes through to applicant tracking systems. Your score and recommendations will appear here when the review is ready.
                </p>
              </div>
            </div>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-cream-dark" aria-hidden="true">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-olive" />
            </div>
            <p className="mt-2 text-xs text-charcoal/50">This may take a little while.</p>
          </div>

          <div className="rounded-lg bg-cream-light p-4 sm:p-5">
            <p className="text-sm font-semibold text-charcoal">What we’re reviewing</p>
            <ul className="mt-3 grid gap-3 text-sm text-charcoal/70">
              <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 shrink-0 text-olive" aria-hidden="true" />Resume structure and section clarity</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 shrink-0 text-olive" aria-hidden="true" />Skills and role related keywords</li>
              <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 shrink-0 text-olive" aria-hidden="true" />Readability for applicant tracking systems</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <section className="rounded-xl border border-cream-dark bg-white px-5 py-10 text-center sm:px-8">
      <AlertTriangle className="mx-auto h-9 w-9 text-amber-600" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-semibold text-charcoal">
        Your resume needs some content before ATS analysis.
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-charcoal/65">
        Add a summary, experience details, skills, or education to get a meaningful ATS readiness score.
      </p>
    </section>
  );
}

function ErrorDashboard({ error }: { error: string | null }) {
  if (error?.includes("already been used")) {
    return (
      <section className="rounded-xl border border-cream-dark bg-white px-5 py-10 text-center sm:px-8 sm:py-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-olive/10">
          <Sparkles className="h-6 w-6 text-olive" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-charcoal sm:text-3xl">Want another ATS review?</h2>
        <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-charcoal/70 sm:text-lg">
          You’ve used your free guest analysis. Sign in to analyze again and get tailored suggestions for improving your resume.
        </p>
        <Link
          href="/auth/login"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-olive px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-olive-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light focus-visible:ring-offset-2"
        >
          Sign in to analyze again
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-cream-dark bg-white px-5 py-10 text-center sm:px-8">
      <AlertTriangle className="mx-auto h-9 w-9 text-destructive" aria-hidden="true" />
      <h2 className="mt-4 text-xl font-semibold text-charcoal">We couldn&apos;t complete the ATS analysis.</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-charcoal/65">
        {error || "Please try again shortly."}
      </p>
    </section>
  );
}

export default function AtsAnalysisPanel({
  onClose,
  backLabel = "Back to builder",
}: {
  onClose: () => void;
  backLabel?: string;
}) {
  const { resumeData, title, persistenceMode, updatePersonal, updateEducation, updateExperience, updateProject } = useResumeBuilder();
  const [analysis, setAnalysis] = useState<ATSAnalysisData | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error" | "empty" | "guest_limit">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzedSignature, setLastAnalyzedSignature] = useState<string | null>(null);
  const analysisBusyRef = useRef(false);
  const planBusyRef = useRef(false);
  const [plan, setPlan] = useState<ATSImprovementPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedPlanItems, setSelectedPlanItems] = useState<Set<string>>(new Set());
  const [confirmPlan, setConfirmPlan] = useState(false);
  const [appliedPlan, setAppliedPlan] = useState(false);
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [beforeAnalysis, setBeforeAnalysis] = useState<ATSAnalysisData | null>(null);
  const [beforeResume, setBeforeResume] = useState<ResumeData | null>(null);

  const resumeSignature = useMemo(() => JSON.stringify(resumeData), [resumeData]);
  const hasData = hasResumeContent(resumeData);

  const runAnalysis = useCallback(async (force = false) => {
    if (analysisBusyRef.current) return;
    if (!hasData) {
      setAnalysis(null);
      setError(null);
      setStatus("empty");
      return;
    }

    analysisBusyRef.current = true;
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/ai/analyze-ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeData, force }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; data?: ATSAnalysisData; error?: string }
        | null;

      if (!response.ok || !payload || payload.success !== true || !payload.data) {
        throw new Error(payload?.error || "We couldn't safely process the ATS analysis. Please try again.");
      }

      setAnalysis(payload.data);
      setLastAnalyzedSignature(resumeSignature);
      if (persistenceMode === "guest") {
        try {
          window.localStorage.setItem("ats_guest_analysis_used", "1");
        } catch {
          // The API cookie still enforces the guest limit when browser storage is unavailable.
        }
      }
      setStatus("ready");
    } catch (caught) {
      setAnalysis(null);
      const message = caught instanceof Error ? caught.message : "We couldn't safely process the ATS analysis. Please try again.";
      if (persistenceMode === "guest" && message.includes("already been used")) {
        setStatus("guest_limit");
      } else {
        setError(message);
        setStatus("error");
      }
    } finally {
      analysisBusyRef.current = false;
    }
  }, [hasData, persistenceMode, resumeData, resumeSignature]);

  const staleAnalysis =
    analysis && lastAnalyzedSignature && lastAnalyzedSignature !== resumeSignature;
  const currentScoreStatus = analysis ? scoreStatus(analysis.overallScore) : null;

  const generatePlan = async () => {
    if (persistenceMode === "guest") return;
    if (planBusyRef.current || !analysis || staleAnalysis) return;
    planBusyRef.current = true;
    setPlanLoading(true);
    setPlanError(null);
    try {
      const response = await fetch("/api/ai/improve-ats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: resumeData, analysis }) });
      const payload: unknown = await response.json().catch(() => null);
      const parsedPlan = ATSImprovementPlanSchema.safeParse(payload);
      const apiError = payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string" ? payload.error : null;
      if (!response.ok || !parsedPlan.success) throw new Error(apiError || "We couldn't prepare suggestions right now. Please try again shortly.");
      const validPlan = parsedPlan.data;
      setPlan(validPlan);
      setAnswers(Object.fromEntries(validPlan.improvements.map((item) => [item.id, ""])));
      setSelectedPlanItems(new Set(validPlan.improvements.map((item) => item.id)));
    } catch (err) { setPlanError(err instanceof Error ? err.message : "We couldn't prepare suggestions right now."); }
    finally { planBusyRef.current = false; setPlanLoading(false); }
  };

  const applyPlan = () => {
    const selectedItems = plan?.improvements.filter((item) => selectedPlanItems.has(item.id) && answers[item.id]?.trim()) ?? [];
    for (const item of selectedItems) {
      const value = answers[item.id].trim();
      if (item.section === "personal" && item.itemId === null) {
        const current = resumeData.personal[item.field as keyof ResumeData["personal"]];
        if (!current?.trim() && item.currentValue === "") updatePersonal({ [item.field]: value });
      } else if (item.section === "education" && item.itemId) {
        const current = resumeData.education.find((entry) => entry.id === item.itemId);
        if (current && !current[item.field as keyof typeof current]?.toString().trim() && item.currentValue === "") updateEducation(item.itemId, { [item.field]: value });
      } else if (item.section === "experience" && item.itemId) {
        const current = resumeData.experience.find((entry) => entry.id === item.itemId);
        if (current && !current[item.field as keyof typeof current]?.toString().trim() && item.currentValue === "") updateExperience(item.itemId, { [item.field]: value });
      } else if (item.section === "projects" && item.itemId) {
        const current = resumeData.projects.find((entry) => entry.id === item.itemId);
        if (item.field === "description" && current?.description === item.currentValue) updateProject(item.itemId, { description: `${current.description.trimEnd()}\n${value}`.trim() });
        else if (current && !current[item.field as keyof typeof current]?.toString().trim() && item.currentValue === "") updateProject(item.itemId, { [item.field]: value });
      }
    }
    if (selectedItems.length) {
      setBeforeScore(analysis?.overallScore ?? null);
      setBeforeAnalysis(analysis);
      setBeforeResume(resumeData);
    }
    setConfirmPlan(false);
    setAppliedPlan(selectedItems.length > 0);
    setPlan(null);
  };

  useEffect(() => {
    if (status === "idle" && hasData) {
      const timer = window.setTimeout(() => {
        if (persistenceMode === "guest") {
          try {
            if (window.localStorage.getItem("ats_guest_analysis_used") === "1") {
              setStatus("guest_limit");
              return;
            }
          } catch {
            // Continue to the API; its httpOnly cookie remains the source of truth.
          }
        }
        void runAnalysis();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [hasData, persistenceMode, runAnalysis, status]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-8 sm:py-7 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel}
        </Button>
      </div>

      <div className="mb-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Resume Health</p>
        <h1 className="mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">ATS Compatibility</h1>
        <p className="mt-1 text-xs text-charcoal/55">Analyzing: {title || "My Resume"}</p>
      </div>

      {status === "loading" && <LoadingDashboard />}

      {status === "idle" && (
        <section className="rounded-xl border border-cream-dark bg-white px-5 py-10 text-center sm:px-8">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-olive/20 bg-olive/5">
              <Sparkles className="h-6 w-6 text-olive" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-charcoal">See how ATS-ready your resume is</h2>
            <p className="max-w-md text-sm leading-6 text-charcoal/65">
              Get an AI-powered review of your resume structure, content, keywords, and opportunities to improve.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mx-auto"
              onClick={() => void runAnalysis()}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Analyze Resume
            </Button>
          </div>
        </section>
      )}

      {status === "empty" && <EmptyDashboard />}
      {status === "error" && <ErrorDashboard error={error} />}
      {status === "guest_limit" && (
        <section className="rounded-xl border border-cream-dark bg-white px-5 py-10 text-center sm:px-8">
          <h2 className="text-xl font-semibold text-charcoal">Your free guest analysis has been used</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-charcoal/65">
            Sign in to run another ATS review, get tailored improvement suggestions, and keep your resume with your account.
          </p>
          <Link href="/auth/login" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-olive px-4 py-2 text-sm font-medium text-white hover:bg-olive-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light focus-visible:ring-offset-2">
            Sign in to continue
          </Link>
        </section>
      )}

      {status === "ready" && analysis && currentScoreStatus && (
        <div className="space-y-6">
          {persistenceMode === "authenticated" ? <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => void runAnalysis(true)}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Re-analyze
            </Button>
          </div> : <div className="rounded-lg border border-olive/20 bg-olive/5 px-4 py-3 text-center text-sm text-charcoal/70">
            This is your one free guest analysis. <Link href="/auth/login" className="font-semibold text-olive-dark underline underline-offset-2">Sign in to analyze again</Link>.
          </div>}

          {staleAnalysis && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
              {persistenceMode === "guest" ? "This review is based on an earlier version of the resume. Sign in to run a fresh analysis." : "This ATS review is based on an earlier version of the resume. Re-analyze to refresh the score."}
            </div>
          )}

          {beforeScore !== null && !staleAnalysis && (
            <div className="rounded-xl border border-olive/20 bg-white p-4 text-center" role="status">
              <p className="font-semibold text-charcoal">ATS score re-checked</p>
              <p className="mt-1 text-sm text-charcoal/70">Before {beforeScore}% · Now {analysis.overallScore}% · {analysis.overallScore - beforeScore >= 0 ? "+" : ""}{analysis.overallScore - beforeScore} points</p>
              {beforeAnalysis && <ul className="mx-auto mt-3 grid max-w-2xl gap-2 text-left text-xs sm:grid-cols-2">{analysis.categories.map((category) => {
                const previous = beforeAnalysis.categories.find((item) => item.id === category.id || item.name === category.name);
                if (!previous) return null;
                const difference = category.score - previous.score;
                return <li key={category.id} className="flex justify-between rounded-md bg-cream-light px-3 py-2"><span>{category.name}</span><span className="font-medium tabular-nums">{previous.score} → {category.score} {difference ? `(${difference > 0 ? "+" : ""}${difference})` : "(no change)"}</span></li>;
              })}</ul>}
              {process.env.NODE_ENV === "development" && beforeResume && <details className="mx-auto mt-3 max-w-2xl text-left text-xs text-charcoal/65"><summary className="cursor-pointer">Development check: data sent and analyzed</summary><pre className="mt-2 overflow-auto rounded bg-cream-light p-3">{JSON.stringify({ before: { title: beforeResume.personal.title, website: beforeResume.personal.website, github: beforeResume.personal.github, education: beforeResume.education.map(({ id, startDate, endDate }) => ({ id, startDate, endDate })), projects: beforeResume.projects.map(({ id, description }) => ({ id, description })) }, currentResumeData: resumeData, atsRequest: { resume: buildATSResumeContext(resumeData), force: true }, atsResult: { overallScore: analysis.overallScore, categories: analysis.categories } }, null, 2)}</pre></details>}
            </div>
          )}

          <section className="rounded-xl border border-cream-dark bg-white px-5 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">ATS Score</p>
              <div className="mt-3 w-full max-w-[13rem]">
                <ATSScoreCircle score={analysis.overallScore} size={208} status={currentScoreStatus} />
              </div>
              <p className="mt-1 text-sm font-medium text-charcoal/60">ATS Compatibility</p>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-charcoal/70 sm:text-base">
                {analysis.summary}
              </p>
            </div>
          </section>

          {!plan && !appliedPlan && analysis.issues.length > 0 && (
            <section className="rounded-xl border border-olive/20 bg-olive/5 p-5 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-6">
              <div><h2 className="text-lg font-semibold text-charcoal">Ready to improve your ATS results?</h2><p className="mt-1 text-sm leading-6 text-charcoal/70">{persistenceMode === "guest" ? "Sign in to get tailored suggestions and keep your resume with your account." : "Review useful updates based on this report. Nothing changes until you provide and approve each detail."}</p></div>
              {persistenceMode === "guest" ? <Link href="/auth/login" className="mt-4 inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-olive px-4 py-2 text-sm font-medium text-white hover:bg-olive-dark sm:mt-0">Sign in to continue</Link> : <Button type="button" variant="primary" className="mt-4 shrink-0 sm:mt-0" disabled={planLoading || Boolean(staleAnalysis)} onClick={() => void generatePlan()}>
                {planLoading ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Finding the most useful ATS improvements...</> : `Make My Resume ATS-Friendly${analysis.issues.length ? ` · ${analysis.issues.length} issues` : ""}`}
              </Button>}
              {staleAnalysis && <p className="mt-2 text-xs text-amber-800">Re-analyze before creating suggestions.</p>}
            </section>
          )}
          {!plan && !appliedPlan && analysis.issues.length === 0 && (
            <section className="rounded-xl border border-olive/20 bg-olive/5 p-5 text-center">
              <h2 className="font-semibold text-charcoal">Your resume is already ATS-friendly</h2>
              <p className="mt-1 text-sm text-charcoal/70">No meaningful issues were found in this review.</p>
              <Button type="button" variant="outline" className="mt-4" onClick={onClose}>Review Resume</Button>
            </section>
          )}

          {planError && <p className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive" role="alert">{planError}</p>}
          {plan && (
            <section className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-charcoal">Improve Your Resume</h2>
              <p className="mt-1 text-sm text-charcoal/65">Only information you enter can be added. Leave anything blank to skip it.</p>
              {plan.improvements.length ? <ul className="mt-4 space-y-4">{plan.improvements.map((item) => <li key={item.id} className="rounded-lg border border-cream-dark bg-cream-light p-4">
                <label className="flex items-start gap-3"><input type="checkbox" className="mt-1 accent-olive" checked={selectedPlanItems.has(item.id)} onChange={() => setSelectedPlanItems((old) => { const next = new Set(old); next.has(item.id) ? next.delete(item.id) : next.add(item.id); return next; })} /><span><span className="font-medium text-charcoal">{item.title}</span><span className="ml-2 text-xs uppercase text-charcoal/55">{item.priority}</span><span className="mt-1 block text-sm text-charcoal/65">{item.reason}</span></span></label>
                <Input className="mt-3" value={answers[item.id] ?? ""} onChange={(event) => setAnswers((old) => ({ ...old, [item.id]: event.target.value }))} placeholder={item.section === "projects" && item.field === "description" ? "Enter a real result to append (optional)" : "Enter your information (optional)"} aria-label={item.title} />
              </li>)}</ul> : <p className="mt-4 text-sm text-charcoal/70">Your resume is already ATS-friendly. No missing details were found for this report.</p>}
              {plan.preserve.length > 0 && <p className="mt-4 text-xs text-charcoal/60">Already working well: {plan.preserve.join(" · ")}</p>}
              {plan.improvements.length > 0 && <div className="mt-5 flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={() => setPlan(null)}>Cancel</Button><Button type="button" variant="primary" disabled={!plan.improvements.some((item) => selectedPlanItems.has(item.id) && answers[item.id]?.trim())} onClick={() => setConfirmPlan(true)}>Review {plan.improvements.filter((item) => selectedPlanItems.has(item.id) && answers[item.id]?.trim()).length} Changes</Button></div>}
            </section>
          )}
          {appliedPlan && <section className="rounded-xl border border-olive/20 bg-white p-5 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-olive" /><h2 className="mt-2 font-semibold text-charcoal">Resume updated successfully</h2><p className="mt-1 text-sm text-charcoal/65">Your builder and saved resume are updating with the details you approved.</p><div className="mt-4 flex justify-center gap-3"><Button type="button" variant="outline" onClick={onClose}>Continue Editing</Button><Button type="button" variant="primary" onClick={() => { setAppliedPlan(false); void runAnalysis(true); }}>Re-check ATS Score</Button></div></section>}
          <Dialog open={confirmPlan} onClose={() => setConfirmPlan(false)} title="Apply selected changes?" description={`Apply ${plan?.improvements.filter((item) => selectedPlanItems.has(item.id) && answers[item.id]?.trim()).length ?? 0} details you provided to your resume?`}>
            <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setConfirmPlan(false)}>Cancel</Button><Button type="button" variant="primary" onClick={applyPlan}>Apply Changes</Button></div>
          </Dialog>

          <CategoryBreakdown categories={analysis.categories} />

          <div className="grid gap-6 lg:grid-cols-2">
            <section
              aria-labelledby="ats-strengths-heading"
              className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-olive" aria-hidden="true" />
                <h2 id="ats-strengths-heading" className="text-lg font-semibold text-charcoal">Strengths</h2>
              </div>
              {analysis.strengths.length > 0 ? (
                <ul className="space-y-3">
                  {analysis.strengths.map((strength) => (
                    <li
                      key={`${strength.title}-${strength.category}`}
                      className="rounded-lg border border-olive/20 bg-olive/5 p-3"
                    >
                      <p className="font-medium text-charcoal">{strength.title}</p>
                      <p className="mt-1 text-sm leading-5 text-charcoal/70">{strength.explanation}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-charcoal/65">
                  No major strengths were identified from the current resume data.
                </p>
              )}
            </section>

            <section
              aria-labelledby="ats-improvements-heading"
              className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <h2 id="ats-improvements-heading" className="text-lg font-semibold text-charcoal">Improvements</h2>
              </div>
              {analysis.issues.length > 0 ? (
                <ul className="space-y-3">
                  {analysis.issues.map((issue) => (
                    <li key={issue.id} className="rounded-lg border border-cream-dark bg-cream-light p-3">
                      <span className="rounded-full border border-cream-dark px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/60">
                        {issue.severity} · {issue.category}
                      </span>
                      <p className="mt-2 font-medium text-charcoal">{issue.title}</p>
                      <p className="mt-1 text-sm leading-5 text-charcoal/70">{issue.explanation}</p>
                      <p className="mt-2 text-sm leading-5 text-charcoal/65">
                        <span className="font-medium text-charcoal">Recommendation:</span>{" "}
                        {issue.recommendation}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-6 text-charcoal/65">
                  No major gaps were identified from the current resume content.
                </p>
              )}
            </section>
          </div>

          <section
            aria-labelledby="ats-keywords-heading"
            className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-olive" aria-hidden="true" />
              <h2 id="ats-keywords-heading" className="text-lg font-semibold text-charcoal">Keyword Analysis</h2>
            </div>
            {analysis.keywordAnalysis.detectedKeywords.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {analysis.keywordAnalysis.detectedKeywords.map((keyword) => (
                  <li
                    key={keyword}
                    className="rounded-full border border-olive/25 bg-olive/5 px-3 py-1.5 text-xs font-medium text-olive-dark"
                  >
                    {keyword}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-charcoal/65">No clear keywords were detected in the current resume content.</p>
            )}
            {analysis.keywordAnalysis.observations.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-charcoal/70">
                {analysis.keywordAnalysis.observations.map((observation) => (
                  <li key={observation} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive" aria-hidden="true" />
                    <span>{observation}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="ats-next-steps-heading"
            className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-olive" aria-hidden="true" />
              <h2 id="ats-next-steps-heading" className="text-lg font-semibold text-charcoal">Next steps</h2>
            </div>
            {analysis.nextSteps.length > 0 ? (
              <ol className="grid gap-3 text-sm text-charcoal/75 sm:grid-cols-2">
                {analysis.nextSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-olive text-[10px] font-semibold text-cream">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-charcoal/65">
                Your resume appears structurally strong. Continue refining details and impact statements.
              </p>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
