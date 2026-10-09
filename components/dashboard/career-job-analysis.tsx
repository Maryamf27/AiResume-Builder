"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BriefcaseBusiness, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { JobAnalysisSchema, MatchAnalysisSchema, ResumeDataSchema, TailoringAnalysisSchema, type JobAnalysis, type MatchAnalysis, type TailoringAnalysis } from "@/lib/ai/schemas";
import type { ResumeData } from "@/types/resume";
import { useDashboardSession } from "@/components/dashboard/dashboard-session";
import { useResumeSummaries } from "@/lib/resume/use-resume-summaries";

const MIN_JOB_DESCRIPTION_LENGTH = 80;
const MAX_JOB_DESCRIPTION_LENGTH = 20_000;
const HANDOFF_KEY = "career-tailoring-handoff";
const WORKFLOW_KEY = "career-tools-job-workflow";

export interface CareerResumeOption { id: string; title: string; updatedAt: string }

export default function CareerJobAnalysis() {
  const { userId } = useDashboardSession();
  const { resumes: cachedResumes } = useResumeSummaries(userId);
  const resumes: CareerResumeOption[] = (cachedResumes ?? []).map((resume) => ({ id: resume.id, title: resume.title, updatedAt: resume.updatedAt }));
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const view = requestedView === "match" || requestedView === "improvements" ? requestedView : "analysis";
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [selectedResumeUpdatedAt, setSelectedResumeUpdatedAt] = useState<string | null>(null);
  const [resumeBusy, setResumeBusy] = useState(false);
  const [match, setMatch] = useState<MatchAnalysis | null>(null);
  const [matchBusy, setMatchBusy] = useState(false);
  const [tailorBusy, setTailorBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analysisResultRef = useRef<HTMLDivElement>(null);
  const matchResultRef = useRef<HTMLDivElement>(null);
  // Set only when a result was just produced by the user's action, so restoring
  // a saved session on page load never yanks the page down.
  const pendingScrollRef = useRef<"analysis" | "match" | null>(null);

  useEffect(() => {
    const target = pendingScrollRef.current;
    const element = target === "match" ? (match ? matchResultRef.current : null) : target === "analysis" ? (analysis ? analysisResultRef.current : null) : null;
    if (!element) return;
    pendingScrollRef.current = null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    element.focus({ preventScroll: true });
  }, [analysis, match]);

  useEffect(() => {
    let active = true;
    try {
      const raw = window.sessionStorage.getItem(WORKFLOW_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { userId?: string; jobDescription?: string; analysis?: unknown; match?: unknown; resumeId?: string; resumeUpdatedAt?: string };
      if (saved.userId !== userId) return;
      const parsedAnalysis = JobAnalysisSchema.safeParse(saved.analysis);
      if (!parsedAnalysis.success || typeof saved.jobDescription !== "string") return;
      setJobDescription(saved.jobDescription);
      setAnalysis(parsedAnalysis.data);
      if (typeof saved.resumeId !== "string") return;
      setSelectedResumeId(saved.resumeId);
      void (async () => {
        const { data, error: queryError } = await createClient().from("resumes").select("data, updated_at").eq("user_id", userId).eq("id", saved.resumeId!).maybeSingle();
        if (!active || queryError || !data) return;
        const parsedResume = ResumeDataSchema.safeParse(data.data);
        if (!parsedResume.success) return;
        setSelectedResume(parsedResume.data);
        setSelectedResumeUpdatedAt(data.updated_at);
        const parsedMatch = MatchAnalysisSchema.safeParse(saved.match);
        if (parsedMatch.success && saved.resumeUpdatedAt === data.updated_at) setMatch(parsedMatch.data);
      })();
    } catch (caught) {
      console.warn("Could not restore Career Tools workflow context:", caught);
    }
    return () => { active = false; };
  }, [userId]);

  async function analyzeJob() {
    const description = jobDescription.trim();
    if (description.length < MIN_JOB_DESCRIPTION_LENGTH || description.length > MAX_JOB_DESCRIPTION_LENGTH) {
      setError(description.length < MIN_JOB_DESCRIPTION_LENGTH ? "Paste a more complete job description (at least 80 characters)." : "This job description is too long. Please shorten it and try again.");
      return;
    }
    if (analysisBusy) return;
    setAnalysisBusy(true); setError(null); setAnalysis(null); setMatch(null); setSelectedResume(null); setSelectedResumeId(null);
    try {
      const response = await fetch("/api/ai/analyze-job", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobDescription: description }) });
      const payload = await response.json().catch(() => null) as { success?: boolean; data?: unknown; error?: string } | null;
      const parsed = JobAnalysisSchema.safeParse(payload?.data);
      if (!response.ok || payload?.success !== true || !parsed.success) throw new Error(payload?.error || "We couldn't analyze this job description. Please try again.");
      pendingScrollRef.current = "analysis";
      setAnalysis(parsed.data);
      window.sessionStorage.setItem(WORKFLOW_KEY, JSON.stringify({ userId, jobDescription: description, analysis: parsed.data }));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn't analyze this job description. Please try again."); }
    finally { setAnalysisBusy(false); }
  }

  async function chooseResume(id: string) {
    setSelectedResumeId(id); setSelectedResume(null); setMatch(null); setError(null);
    if (!id) return;
    setResumeBusy(true);
    try {
      const { data, error: queryError } = await createClient().from("resumes").select("data, updated_at").eq("user_id", userId).eq("id", id).maybeSingle();
      if (queryError || !data) throw new Error("Couldn't load that resume. Please choose it again.");
      const parsed = ResumeDataSchema.safeParse(data.data);
      if (!parsed.success) throw new Error("This saved resume couldn't be read. Please open and save it in the builder first.");
      setSelectedResume(parsed.data);
      setSelectedResumeUpdatedAt(data.updated_at);
      if (analysis) window.sessionStorage.setItem(WORKFLOW_KEY, JSON.stringify({ userId, jobDescription, analysis, resumeId: id, resumeUpdatedAt: data.updated_at }));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Couldn't load that resume."); }
    finally { setResumeBusy(false); }
  }

  async function matchResume() {
    if (!analysis || !selectedResume || matchBusy) return;
    setMatchBusy(true); setError(null); setMatch(null);
    try {
      const response = await fetch("/api/ai/match-resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: selectedResume, job: analysis }) });
      const payload = await response.json().catch(() => null) as { success?: boolean; data?: unknown; error?: string } | null;
      const parsed = MatchAnalysisSchema.safeParse(payload?.data);
      if (!response.ok || payload?.success !== true || !parsed.success) throw new Error(payload?.error || "We couldn't match this resume to the job. Please try again.");
      pendingScrollRef.current = "match";
      setMatch(parsed.data);
      if (selectedResumeId && selectedResumeUpdatedAt) window.sessionStorage.setItem(WORKFLOW_KEY, JSON.stringify({ userId, jobDescription, analysis, resumeId: selectedResumeId, resumeUpdatedAt: selectedResumeUpdatedAt, match: parsed.data }));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn't match this resume to the job."); }
    finally { setMatchBusy(false); }
  }

  async function tailorResume() {
    if (!analysis || !match || !selectedResume || !selectedResumeId || tailorBusy) return;
    setTailorBusy(true); setError(null);
    try {
      const response = await fetch("/api/ai/tailor-resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: selectedResume, job: analysis, match }) });
      const payload = await response.json().catch(() => null) as { success?: boolean; data?: unknown; error?: string } | null;
      const parsed = TailoringAnalysisSchema.safeParse(payload?.data);
      if (!response.ok || payload?.success !== true || !parsed.success) throw new Error(payload?.error || "We couldn't prepare resume suggestions. Please try again.");
      window.sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(parsed.data));
      router.push(`/builder?id=${encodeURIComponent(selectedResumeId)}&careerTailoring=1`);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We couldn't prepare resume suggestions."); }
    finally { setTailorBusy(false); }
  }

  if (view !== "analysis" && !analysis) {
    const label = view === "match" ? "Job Match" : "AI Resume Improvements";
    return <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
      <header className="mb-6 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Career Tools</p><h1 className="mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">{label}</h1><p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-charcoal/65">{view === "match" ? "Analyze a job description first. Your analysis will be available here for matching with a saved resume." : "Complete a Job Match first. Your match and resume will be used to prepare tailored suggestions."}</p></header>
      <section className="rounded-xl border border-cream-dark bg-white p-6 text-center"><p className="text-sm text-charcoal/70">{view === "match" ? "There is no analyzed job in this browser session yet." : "There is no completed job match in this browser session yet."}</p><Link href="/dashboard/career-tools/job-analysis" className="mt-4 inline-flex rounded-md bg-olive px-4 py-2 text-sm font-medium text-white">Go to Job Analysis</Link></section>
    </main>;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-8">
      <header className="mb-6 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Career Tools</p><h1 className="mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">{view === "analysis" ? "Job Analysis" : view === "match" ? "Job Match" : "AI Resume Improvements"}</h1><p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-charcoal/65">{view === "analysis" ? "Understand what an employer is looking for. You can analyze a job before choosing a resume." : view === "match" ? "Use the analyzed job and a saved resume to review how well they fit." : "Review improvements based on your analyzed job, resume, and match."}</p></header>
      {view === "analysis" && <section className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6">
        <label htmlFor="career-job-description" className="mb-3 flex items-center gap-2 text-lg font-semibold text-charcoal"><BriefcaseBusiness className="h-4 w-4 text-olive" />Paste a job description</label>
        <textarea id="career-job-description" value={jobDescription} onChange={(event) => { setJobDescription(event.target.value); setAnalysis(null); setMatch(null); setSelectedResume(null); setSelectedResumeId(null); window.sessionStorage.removeItem(WORKFLOW_KEY); }} placeholder="Paste the full job description here..." maxLength={MAX_JOB_DESCRIPTION_LENGTH} className="min-h-56 w-full rounded-xl border border-cream-dark bg-cream-light px-4 py-3 text-sm leading-6 text-charcoal outline-none focus:border-olive focus:ring-2 focus:ring-olive/20" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-charcoal/55">{jobDescription.trim().length}/{MAX_JOB_DESCRIPTION_LENGTH} characters</span><Button type="button" variant="primary" disabled={analysisBusy} onClick={() => void analyzeJob()}>{analysisBusy ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing job…</> : <><Sparkles className="h-4 w-4" />Analyze Job</>}</Button></div>
      </section>}

      {error && <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">{error}</p>}
      {analysis && <div className="mt-6 space-y-5">
        <section ref={analysisResultRef} tabIndex={-1} className="scroll-mt-20 rounded-xl border border-cream-dark bg-white p-5 outline-none sm:p-6 lg:scroll-mt-6"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-olive" /><h2 className="text-lg font-semibold text-charcoal">Job Analysis Complete</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Info label="Role" value={analysis.jobTitle || "Not specified"} /><Info label="Company" value={analysis.companyName || "Not specified"} /><Info label="Location" value={analysis.location || "Not specified"} /><Info label="Employment type" value={analysis.employmentType || "Not specified"} /></div><p className="mt-4 text-sm leading-6 text-charcoal/70">{analysis.summary}</p></section>
        <section className="grid gap-5 md:grid-cols-2"><ListCard title="Responsibilities" items={analysis.responsibilities} /><ListCard title="Required skills" items={analysis.requiredSkills.map((item) => item.skill)} /><ListCard title="Preferred skills" items={analysis.preferredSkills.map((item) => item.skill)} /><ListCard title="Keywords" items={analysis.keywords} /><ListCard title="Experience requirements" items={analysis.experienceRequirements.map((item) => item.requirement)} /><ListCard title="Education requirements" items={analysis.educationRequirements.map((item) => item.requirement)} /></section>

        <section className="rounded-xl border border-cream-dark bg-white p-5 sm:p-6"><h2 className="text-lg font-semibold text-charcoal">Match with a resume</h2><p className="mt-1 text-sm text-charcoal/65">Choose one of your saved resumes. The job analysis above will be reused.</p>
          {resumes.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{resumes.map((resume) => <button key={resume.id} type="button" onClick={() => void chooseResume(resume.id)} className={`rounded-lg border p-4 text-left transition-colors ${selectedResumeId === resume.id ? "border-olive bg-olive/5" : "border-cream-dark bg-cream-light hover:border-olive/50"}`}><span className="block text-sm font-semibold text-charcoal">{resume.title}</span><span className="mt-1 block text-xs text-charcoal/55">Last edited {formatDate(resume.updatedAt)}</span></button>)}</div> : <p className="mt-4 rounded-lg bg-cream-light p-4 text-sm text-charcoal/65">You haven’t saved a resume yet. Create one to use Job Match and Tailoring.</p>}
          {resumeBusy && <p className="mt-3 flex items-center gap-2 text-sm text-charcoal/65"><Loader2 className="h-4 w-4 animate-spin" />Loading selected resume…</p>}
          {selectedResume && <Button type="button" variant="primary" className="mt-4" disabled={matchBusy} onClick={() => void matchResume()}>{matchBusy ? <><Loader2 className="h-4 w-4 animate-spin" />Matching…</> : "Match With This Resume"}</Button>}
          {match && <div ref={matchResultRef} tabIndex={-1} className="mt-5 scroll-mt-20 rounded-lg border border-olive/20 bg-olive/5 p-4 outline-none lg:scroll-mt-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-charcoal/55">Resume Match</p><p className="mt-1 text-2xl font-semibold text-charcoal">{match.overallScore}%</p></div><Button type="button" variant="primary" disabled={tailorBusy} onClick={() => void tailorResume()}>{tailorBusy ? <><Loader2 className="h-4 w-4 animate-spin" />Preparing suggestions…</> : "Tailor This Resume"}</Button></div><p className="mt-2 text-sm leading-6 text-charcoal/70">{match.summary}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><ListCard title="Matched skills" items={match.matchedSkills.map((item) => item.skill)} /><ListCard title="Skills to consider" items={match.missingSkills.map((item) => item.skill)} /></div><p className="mt-3 text-xs text-charcoal/55">Tailoring will use this job analysis and match, then open the existing review and apply flow. Nothing changes without your approval.</p></div>}
        </section>
      </div>}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-cream-dark bg-cream-light p-3"><p className="text-xs font-medium uppercase tracking-wide text-charcoal/50">{label}</p><p className="mt-1 text-sm font-semibold text-charcoal">{value}</p></div>; }
function ListCard({ title, items }: { title: string; items: string[] }) { return <section className="rounded-xl border border-cream-dark bg-white p-5"><h2 className="text-base font-semibold text-charcoal">{title}</h2>{items.length ? <ul className="mt-3 space-y-2 text-sm text-charcoal/70">{items.slice(0, 8).map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive" />{item}</li>)}</ul> : <p className="mt-2 text-sm text-charcoal/55">None listed.</p>}</section>; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "recently" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
