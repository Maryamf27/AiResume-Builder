"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createResume,
  deleteResume,
  recordTemplateEvent,
  renameResume,
  type ResumeListItem,
} from "@/lib/resume/resumes";
import { buildResumeDocument, printResumeDocument, resumePdfFilename } from "@/lib/resume/pdf";
import { createClient } from "@/lib/supabase/client";
import type { PublishedTemplate } from "@/lib/templates/types";

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ResumeList({
  userId,
  initialResumes,
}: {
  userId: string;
  initialResumes: ResumeListItem[];
}) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [templates, setTemplates] = useState<PublishedTemplate[]>([]);

  const [creating, setCreating] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ResumeListItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [renaming, setRenaming] = useState<ResumeListItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Published templates are needed to render downloads; readable by everyone.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await createClient()
        .from("templates")
        .select("id, name, slug, category, description, html, css")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (!cancelled) setTemplates(data ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function templateName(resume: ResumeListItem): string | null {
    const id = resume.data?.templateId;
    if (!id) return null;
    return templates.find((t) => t.id === id)?.name ?? null;
  }

  async function handleCreate() {
    if (creating) return;
    setCreating(true);
    setActionError(null);
    const result = await createResume(userId);
    if (!result.ok) {
      setCreating(false);
      setActionError("Couldn't create a new resume. Please try again.");
      return;
    }
    router.push(`/builder?id=${result.id}`);
  }

  async function handleDownload(resume: ResumeListItem) {
    if (downloadingId) return;
    setDownloadingId(resume.id);
    setActionError(null);
    try {
      const template =
        templates.find((t) => t.id === resume.data?.templateId) ?? templates[0] ?? null;
      const filename = resumePdfFilename(resume.title, resume.data);
      const doc = buildResumeDocument(template, resume.data, filename);
      printResumeDocument(doc);
      // Only count the download once the print window actually opened.
      if (template) recordTemplateEvent(template.id, userId, "downloaded");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Couldn't prepare the PDF. Please try again."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete() {
    if (!deleting || deleteBusy) return;
    setDeleteBusy(true);
    const error = await deleteResume(deleting.id);
    setDeleteBusy(false);
    if (error) {
      setActionError("Couldn't delete the resume. Please try again.");
      setDeleting(null);
      return;
    }
    setResumes((prev) => prev.filter((r) => r.id !== deleting.id));
    setDeleting(null);
    router.refresh();
  }

  async function handleRename() {
    if (!renaming || renameBusy) return;
    setRenameBusy(true);
    const error = await renameResume(renaming.id, renameValue);
    setRenameBusy(false);
    if (error) {
      setActionError("Couldn't rename the resume. Please try again.");
      setRenaming(null);
      return;
    }
    const newTitle = renameValue.trim() || "My Resume";
    setResumes((prev) =>
      prev.map((r) => (r.id === renaming.id ? { ...r, title: newTitle } : r))
    );
    setRenaming(null);
    router.refresh();
  }

  if (resumes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-cream-dark bg-cream-light px-6 py-14 text-center">
        <FileText className="mx-auto h-8 w-8 text-charcoal/30" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-xl text-charcoal">Create your first resume</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-charcoal/60">
          Pick a template, fill in your details, and download a polished PDF in
          minutes.
        </p>
        <Button className="mt-6" onClick={() => void handleCreate()} disabled={creating}>
          {creating ? (
            <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
          )}
          Create your first resume
        </Button>
        {actionError && (
          <p className="mt-3 text-sm text-destructive" role="alert">{actionError}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {actionError && (
        <p className="mb-4 text-sm text-destructive" role="alert">{actionError}</p>
      )}
      <ul className="flex flex-col gap-3">
        {resumes.map((resume) => (
          <li
            key={resume.id}
            className="flex flex-col gap-4 rounded-lg border border-cream-dark bg-cream-light p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-charcoal">
                {resume.title}
              </p>
              <p className="mt-1 text-xs text-charcoal/55">
                {templateName(resume) && <>{templateName(resume)} · </>}
                Updated {formatDate(resume.updatedAt)} · Created{" "}
                {formatDate(resume.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/builder?id=${resume.id}`}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-olive px-3 text-sm font-medium text-cream transition-colors hover:bg-olive-dark"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </Link>
              <Button
                variant="outline-olive"
                size="sm"
                onClick={() => void handleDownload(resume)}
                disabled={downloadingId !== null}
              >
                {downloadingId === resume.id ? (
                  <>
                    <Loader2 data-icon="inline-start" className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Preparing PDF…
                  </>
                ) : (
                  <>
                    <Download data-icon="inline-start" className="h-3.5 w-3.5" aria-hidden="true" />
                    Download
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRenameValue(resume.title);
                  setRenaming(resume);
                }}
              >
                Rename
              </Button>
              <Button variant="ghost-destructive" size="sm" onClick={() => setDeleting(resume)}>
                <Trash2 data-icon="inline-start" className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {/* Delete confirmation */}
      <Dialog
        open={deleting !== null}
        onClose={() => !deleteBusy && setDeleting(null)}
        title="Delete this resume?"
        description={`“${deleting?.title}” will be permanently removed. This can't be undone.`}
      >
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleting(null)} disabled={deleteBusy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteBusy}>
            {deleteBusy && (
              <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Delete resume
          </Button>
        </div>
      </Dialog>

      {/* Rename */}
      <Dialog
        open={renaming !== null}
        onClose={() => !renameBusy && setRenaming(null)}
        title="Rename resume"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleRename();
          }}
          className="mt-4 flex flex-col gap-4"
        >
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="My Resume"
            maxLength={120}
            autoFocus
            aria-label="Resume title"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRenaming(null)} disabled={renameBusy}>
              Cancel
            </Button>
            <Button type="submit" disabled={renameBusy}>
              {renameBusy && (
                <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Save
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export { type ResumeListItem };
