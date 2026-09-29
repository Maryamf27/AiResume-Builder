"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, LayoutTemplate, LogOut, Plus, Settings, Trash2, Download, Pencil } from "lucide-react";
import Button, { buttonClassName } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ResumeRow } from "@/types/supabase";

export default function DashboardWorkspace({ resumes, name, isAdmin }: { resumes: ResumeRow[]; name: string; isAdmin: boolean }) {
  const [items, setItems] = useState(resumes);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  async function deleteResume(id: string) {
    setDeleting(id);
    const { error } = await createClient().from("resumes").delete().eq("id", id);
    if (!error) setItems((current) => current.filter((item) => item.id !== id));
    setDeleting(null);
  }
  return <div className="min-h-screen bg-cream">
    <header className="border-b border-cream-dark bg-cream-light"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/" className="font-serif text-xl">Resonance</Link><nav className="flex items-center gap-3 text-sm"><Link href="/templates">Templates</Link><Link href="/auth/signout" className="flex items-center gap-1"><LogOut data-icon="inline-start" />Sign out</Link></nav></div></header>
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[210px_1fr]"><aside className="hidden border-r border-cream-dark pr-6 lg:block"><nav className="flex flex-col gap-2 text-sm"><Link className="rounded-md bg-cream-dark px-3 py-2 font-medium" href="/dashboard"><FileText data-icon="inline-start" />Dashboard</Link><Link className="rounded-md px-3 py-2 hover:bg-cream-dark" href="/dashboard"><FileText data-icon="inline-start" />My Resumes</Link><Link className="rounded-md px-3 py-2 hover:bg-cream-dark" href="/templates"><LayoutTemplate data-icon="inline-start" />Templates</Link><Link className="rounded-md px-3 py-2 hover:bg-cream-dark" href="/account"><Settings data-icon="inline-start" />Account</Link>{isAdmin && <Link className="rounded-md px-3 py-2 hover:bg-cream-dark" href="/admin/templates">Admin templates</Link>}</nav></aside>
      <main><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm text-charcoal/60">Your workspace</p><h1 className="font-serif text-4xl">Good to see you, {name}</h1><p className="mt-2 text-charcoal/65">Keep your experience current and ready for the next opportunity.</p></div><Link href="/builder" className={buttonClassName({})}><Plus data-icon="inline-start" />Create New Resume</Link></div>
      <section className="mt-12"><h2 className="font-serif text-2xl">My Resumes</h2>{items.length === 0 ? <div className="mt-5 border border-dashed border-cream-dark bg-cream-light px-6 py-14 text-center"><FileText className="mx-auto mb-4 text-olive" aria-hidden="true" /><h3 className="font-serif text-2xl">Create your first resume</h3><p className="mx-auto mt-2 max-w-md text-sm text-charcoal/60">Start with a calm, focused editor and return whenever you are ready.</p><Link href="/builder" className={buttonClassName({ className: "mt-6" })}>Create resume</Link></div> : <div className="mt-5 grid gap-3">{items.map((resume) => <article key={resume.id} className="flex flex-col gap-4 border border-cream-dark bg-cream-light p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-medium">{resume.title || "My Resume"}</h3><p className="mt-1 text-sm text-charcoal/55">Updated {new Date(resume.updated_at).toLocaleDateString()}</p></div><div className="flex flex-wrap items-center gap-2"><Link href={`/builder?resume=${resume.id}`} className={buttonClassName({ variant: "outline", size: "sm" })}><Pencil data-icon="inline-start" />Edit</Link><Link href={`/builder?resume=${resume.id}#download`} className={buttonClassName({ variant: "ghost", size: "sm" })}><Download data-icon="inline-start" />Download</Link><Button variant="ghost" size="sm" disabled={deleting === resume.id} onClick={() => setPendingDelete(resume.id)}><Trash2 data-icon="inline-start" />Delete</Button></div></article>)}</div>}</section></main></div>
    {pendingDelete && <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/30 p-5" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md border border-cream-dark bg-cream-light p-6 shadow-lg"><h2 id="delete-title" className="font-serif text-2xl">Delete resume?</h2><p className="mt-2 text-sm text-charcoal/65">This permanently removes this resume from your workspace.</p><div className="mt-6 flex justify-end gap-2"><Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button><Button variant="destructive" onClick={() => { void deleteResume(pendingDelete); setPendingDelete(null); }}>Delete resume</Button></div></div></div>}
  </div>;
}
