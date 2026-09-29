"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, FileText, LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import Button, { buttonClassName } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ResumeRecord } from "@/types/resume";

export default function ResumeDashboard({ name, resumes }: { name: string; resumes: ResumeRecord[] }) {
  const [items, setItems] = useState(resumes);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function deleteResume(id: string) {
    if (!window.confirm("Delete this resume? This cannot be undone.")) return;
    setDeleting(id);
    const { error } = await createClient().from("resumes").delete().eq("id", id);
    if (!error) setItems((current) => current.filter((resume) => resume.id !== id));
    setDeleting(null);
  }

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <header className="border-b border-cream-dark/70 bg-cream-light">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/dashboard" className="font-serif text-xl">Resonance</Link>
          <nav className="hidden items-center gap-5 text-sm text-charcoal/70 md:flex">
            <Link href="/dashboard" className="text-charcoal">Dashboard</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/auth/signout">Sign out</Link>
          </nav>
          <Link href="/builder" className={buttonClassName({ size: "sm" })}><Plus data-icon="inline-start" /> New resume</Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-olive">Your workspace</p>
            <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Good to see you, {name}</h1>
            <p className="mt-3 max-w-xl text-charcoal/65">Keep your applications moving with resumes that are clear, considered, and ready to share.</p>
          </div>
          <Link href="/builder" className={buttonClassName({ size: "lg" })}><Plus data-icon="inline-start" /> Create New Resume</Link>
        </div>

        <section className="mt-14" aria-labelledby="my-resumes-heading">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div><h2 id="my-resumes-heading" className="font-serif text-2xl">My Resumes</h2><p className="mt-1 text-sm text-charcoal/55">{items.length} saved {items.length === 1 ? "resume" : "resumes"}</p></div>
            <Link href="/templates" className="hidden items-center gap-2 text-sm font-medium text-olive hover:underline sm:flex"><LayoutTemplate data-icon="inline-start" /> Browse templates</Link>
          </div>
          {items.length === 0 ? <div className="border border-dashed border-cream-dark bg-cream-light px-6 py-16 text-center"><FileText className="mx-auto mb-4 text-olive" /><h3 className="font-serif text-2xl">Create your first resume</h3><p className="mx-auto mt-2 max-w-md text-sm text-charcoal/60">Start with a thoughtful template and build a resume you'll be proud to send.</p><Link href="/builder" className={buttonClassName({ className: "mt-6" })}>Create New Resume</Link></div> : <div className="grid gap-4 lg:grid-cols-2">{items.map((resume) => <article key={resume.id} className="flex flex-col justify-between border border-cream-dark bg-cream-light p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="mb-3 flex size-10 items-center justify-center bg-olive/10 text-olive"><FileText /></div><h3 className="font-serif text-xl">{resume.title || "My Resume"}</h3><p className="mt-1 text-sm text-charcoal/55">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p></div><span className="text-xs uppercase tracking-wider text-charcoal/40">Resume</span></div><div className="mt-7 flex flex-wrap gap-2"><Link href="/builder" className={buttonClassName({ size: "sm" })}><Pencil data-icon="inline-start" /> Edit</Link><Button size="sm" variant="outline" type="button" onClick={() => window.print()}><Download data-icon="inline-start" /> Download</Button><Button size="sm" variant="ghost" type="button" disabled={deleting === resume.id} onClick={() => deleteResume(resume.id)}><Trash2 data-icon="inline-start" /> {deleting === resume.id ? "Deleting…" : "Delete"}</Button></div></article>)}</div>}
        </section>
      </main>
    </div>
  );
}

export function toResumeRecord(row: Record<string, unknown>): ResumeRecord {
  return { id: String(row.id), userId: String(row.user_id), title: String(row.title ?? "My Resume"), data: row.data as ResumeRecord["data"], version: 1, createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}
