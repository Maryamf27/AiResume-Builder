"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { DEFAULT_RESUME_TITLE } from "@/lib/resume/constants";
import { useDashboardSession } from "@/components/dashboard/dashboard-session";
import { useResumeSummaries } from "@/lib/resume/use-resume-summaries";

export default function CareerAtsResumePicker() {
  const { userId } = useDashboardSession();
  const { resumes, error } = useResumeSummaries(userId);
  return <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-8 sm:py-8">
    <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-charcoal/65 hover:text-charcoal"><ArrowLeft className="h-4 w-4" />Dashboard</Link>
    <header className="mb-6 mt-5 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Career Tools</p><h1 className="mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">ATS Analysis</h1><p className="mt-2 text-sm text-charcoal/65">Choose a saved resume to review its ATS compatibility and improvement options.</p></header>
    {resumes?.length ? <ul className="space-y-3">{resumes.map((resume) => <li key={resume.id}><Link href={`/builder?id=${encodeURIComponent(resume.id)}&panel=ats`} className="group flex items-center justify-between gap-4 rounded-lg border border-cream-dark bg-cream-light p-4 transition-all duration-200 hover:border-olive/50 hover:bg-white"><span className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-olive/10 text-olive"><FileText className="h-5 w-5" /></span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-charcoal">{resume.title || DEFAULT_RESUME_TITLE}</span><span className="mt-1 block text-xs text-charcoal/55">Last edited {new Date(resume.updatedAt).toLocaleDateString()}</span></span></span><span className="group/analyze inline-flex shrink-0 items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-olive-dark transition-colors duration-200 group-hover/analyze:bg-amber-100 group-hover:bg-amber-100"><span>Analyze</span><Sparkles className="h-4 w-4 origin-center scale-100 fill-amber-300 text-amber-500 transition-transform duration-200 group-hover/analyze:scale-125 group-hover/analyze:fill-yellow-400 group-hover/analyze:text-yellow-600" /></span></Link></li>)}</ul> : resumes && <section className="rounded-xl border border-dashed border-cream-dark bg-cream-light p-8 text-center"><p className="font-medium text-charcoal">Create a resume before running ATS Analysis.</p><Link href="/builder?new=1" className="mt-4 inline-flex rounded-md bg-olive px-4 py-2 text-sm font-medium text-white">Create Resume</Link></section>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">Resumes could not be loaded. Refresh to try again.</p>}
  </main>;
}
