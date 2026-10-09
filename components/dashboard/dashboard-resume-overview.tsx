"use client";

import Link from "next/link";
import { ArrowRight, FileText, Pencil } from "lucide-react";
import CreateResumeButton from "@/components/dashboard/create-resume-button";
import { DEFAULT_RESUME_TITLE } from "@/lib/resume/constants";
import { useResumeSummaries } from "@/lib/resume/use-resume-summaries";

export default function DashboardResumeOverview({ displayName, userId, templateCount }: { displayName: string; userId: string; templateCount?: number }) {
  const { resumes } = useResumeSummaries(userId);

  const total = resumes?.length ?? 0;
  const recent = resumes?.slice(0, 3) ?? [];
  const lastEdited = recent[0]?.updatedAt;
  return <>
    <div className="w-full min-w-0 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="font-serif text-2xl text-charcoal sm:text-3xl">Good to see you, {displayName}</h1><p className="mt-2 text-sm text-charcoal/60">Pick up where you left off, or start something new.</p></div>
      <CreateResumeButton hasSavedResume={total > 0} />
    </div>
    <dl className="mt-8 grid gap-4 sm:grid-cols-3">
      <Stat label="Resumes" value={resumes ? String(total) : "…"} />
      <Stat label="Last edited" value={lastEdited ? formatDate(lastEdited) : "—"} />
      <Stat label="Templates available" value={templateCount === undefined ? "…" : String(templateCount)} />
    </dl>
    <section className="mt-10" aria-labelledby="recent-heading">
      <div className="mb-4 flex items-center justify-between"><h2 id="recent-heading" className="text-sm font-semibold uppercase tracking-wide text-charcoal/50">My Resumes</h2>{total > 0 && <Link href="/dashboard/resumes" className="inline-flex items-center gap-1 text-sm font-medium text-olive hover:text-olive-dark">View all<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}</div>
      {recent.length > 0 ? <ul className="flex flex-col gap-3">{recent.map((resume) => <li key={resume.id}><Link href={`/builder?id=${resume.id}`} className="group flex items-center justify-between gap-4 rounded-lg border border-cream-dark bg-cream-light p-4 transition-colors hover:border-olive/50"><div className="min-w-0"><p className="truncate text-sm font-semibold text-charcoal">{resume.title || DEFAULT_RESUME_TITLE}</p><p className="mt-1 text-xs text-charcoal/55">Updated {formatDate(resume.updatedAt)}</p></div><span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-charcoal/60 group-hover:text-olive"><Pencil className="h-3.5 w-3.5" aria-hidden="true" />Continue</span></Link></li>)}</ul> : resumes && <div className="rounded-lg border border-dashed border-cream-dark bg-cream-light px-6 py-10 text-center"><FileText className="mx-auto h-7 w-7 text-charcoal/30" aria-hidden="true" /><p className="mt-3 text-sm text-charcoal/65">No resumes yet. Create your first one to get started.</p></div>}
    </section>
  </>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-cream-dark bg-cream-light p-4"><dt className="text-xs font-medium uppercase tracking-wide text-charcoal/50">{label}</dt><dd className="mt-1.5 font-serif text-2xl text-charcoal">{value}</dd></div>; }
function formatDate(iso: string): string { const date = new Date(iso); return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
