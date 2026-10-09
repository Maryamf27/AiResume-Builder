"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  TextCursorInput,
  Trash2,
} from "lucide-react";
import Button from "@/components/ui/button";
import ButtonLink from "@/components/ui/button-link";
import Dialog from "@/components/ui/dialog";
import IconAction from "@/components/dashboard/icon-action";
import ResumePreviewDialog from "@/components/dashboard/resume-preview-dialog";
import { Input } from "@/components/ui/input";
import {
  deleteResume,
  recordTemplateEvent,
  renameResume,
  type ResumeListItem,
} from "@/lib/resume/resumes";
import { buildResumeDocument, downloadResumePdf, resumePdfFilename } from "@/lib/resume/pdf";
import { createClient } from "@/lib/supabase/client";
import type { PublishedTemplate } from "@/lib/templates/types";
import { loadPublishedTemplatesClient } from "@/lib/templates/client-cache";
import { removeCachedResume, updateCachedResume } from "@/lib/resume/client-cache";
import { useResumeSummaries } from "@/lib/resume/use-resume-summaries";
import type { ResumeData } from "@/types/resume";

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
}: {
  userId: string;
}) {
  const { resumes: cachedResumes } = useResumeSummaries(userId);
  const resumes: ResumeListItem[] = (cachedResumes ?? []).map((resume) => ({ ...resume, data: { templateId: resume.templateId } as ResumeData }));
  const [templates, setTemplates] = useState<PublishedTemplate[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const [previewing, setPreviewing] = useState<ResumeListItem | null>(null);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ResumeListItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [renaming, setRenaming] = useState<ResumeListItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(null);

  // Published templates are needed to render downloads; readable by everyone.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadPublishedTemplatesClient();
      if (!cancelled) {
        setTemplates(data ?? []);
        setTemplatesLoaded(true);
      }
    })().catch((error: unknown) => {
      console.error("Could not load templates for resume previews:", error);
      setTemplatesLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function templateName(resume: ResumeListItem): string | null {
    const id = resume.data?.templateId;
    if (!id) return null;
    return templates.find((t) => t.id === id)?.name ?? null;
  }

  // Same template choice as a download: the resume's own, else the first published.
  function templateFor(resume: ResumeListItem): PublishedTemplate | null {
    return templates.find((t) => t.id === resume.data?.templateId) ?? templates[0] ?? null;
  }

  async function loadFullResume(resume: ResumeListItem): Promise<ResumeListItem | null> {
    const { data, error } = await createClient().from("resumes").select("data").eq("id", resume.id).eq("user_id", userId).maybeSingle();
    if (error || !data) return null;
    return { ...resume, data: data.data as unknown as ResumeData };
  }

  async function openPreview(resume: ResumeListItem) {
    setActionError(null);
    setLoadingDocumentId(resume.id);
    const fullResume = await loadFullResume(resume);
    setLoadingDocumentId(null);
    if (!fullResume) {
      setActionError("Couldn't load this resume for preview. Please try again.");
      return;
    }
    setPreviewing(fullResume);
  }

  const preview = useMemo(() => {
    if (!previewing) return { srcDoc: null as string | null, error: null as string | null };
    try {
      const template =
        templates.find((t) => t.id === previewing.data?.templateId) ?? templates[0] ?? null;
      const filename = resumePdfFilename(previewing.title);
      return { srcDoc: buildResumeDocument(template, previewing.data, filename), error: null };
    } catch (err) {
      console.error("Resume preview failed:", err);
      return { srcDoc: null, error: "This resume couldn't be previewed." };
    }
  }, [previewing, templates]);

  async function handleDownload(resume: ResumeListItem) {
    if (downloadingId) return;
    setDownloadingId(resume.id);
    setActionError(null);
    try {
      const fullResume = await loadFullResume(resume);
      if (!fullResume) throw new Error("Couldn't load this resume. Please try again.");
      const template = templateFor(fullResume);
      const filename = resumePdfFilename(resume.title);
      const doc = buildResumeDocument(template, fullResume.data, filename);
      await downloadResumePdf(doc, filename);
      // Only count a download after the PDF has been generated successfully.
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
    removeCachedResume(userId, deleting.id);
    setDeleting(null);
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
    updateCachedResume(userId, { id: renaming.id, title: newTitle, createdAt: renaming.createdAt, updatedAt: new Date().toISOString() });
    setRenaming(null);
  }

  if (!cachedResumes) return <div className="h-20 animate-pulse rounded-lg bg-cream-dark/40" aria-label="Loading resumes" />;

  if (resumes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-cream-dark bg-cream-light px-6 py-14 text-center">
        <FileText className="mx-auto h-8 w-8 text-charcoal/30" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-xl text-charcoal">Create your first resume</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-charcoal/60">
          Pick a template, fill in your details, and download a polished PDF in
          minutes.
        </p>
        <ButtonLink href="/builder?new=1" className="mt-6">
          <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
          Create your first resume
        </ButtonLink>
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
            <div className="flex items-center gap-1.5">
              <IconAction
                label="Preview"
                tone="outline"
                onClick={() => void openPreview(resume)}
                disabled={!templatesLoaded || loadingDocumentId !== null}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
              </IconAction>
              <IconAction label="Edit" tone="primary" href={`/builder?id=${resume.id}`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </IconAction>
              <IconAction
                label={downloadingId === resume.id ? "Preparing PDF…" : "Download PDF"}
                tone="outline-olive"
                onClick={() => void handleDownload(resume)}
                disabled={downloadingId !== null}
              >
                {downloadingId === resume.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
              </IconAction>
              <IconAction
                label="Rename"
                tone="ghost"
                onClick={() => {
                  setRenameValue(resume.title);
                  setRenaming(resume);
                }}
              >
                <TextCursorInput className="h-4 w-4" aria-hidden="true" />
              </IconAction>
              <IconAction label="Delete" tone="danger" onClick={() => setDeleting(resume)}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </IconAction>
            </div>
          </li>
        ))}
      </ul>

      {/* Preview */}
      <ResumePreviewDialog
        open={previewing !== null}
        onClose={() => setPreviewing(null)}
        title={previewing?.title ?? ""}
        templateName={previewing ? (templateFor(previewing)?.name ?? null) : null}
        srcDoc={preview.srcDoc}
        error={preview.error}
        editHref={previewing ? `/builder?id=${previewing.id}` : "/dashboard/resumes"}
        onDownload={() => previewing && void handleDownload(previewing)}
        downloading={downloadingId !== null && downloadingId === previewing?.id}
      />

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

