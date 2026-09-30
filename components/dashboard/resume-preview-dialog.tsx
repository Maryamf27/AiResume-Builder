"use client";

import Link from "next/link";
import { Download, Loader2, Pencil } from "lucide-react";
import Button, { buttonClassName } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import TemplateFrame from "@/components/templates/template-frame";

export default function ResumePreviewDialog({
  open,
  onClose,
  title,
  templateName,
  srcDoc,
  error,
  editHref,
  onDownload,
  downloading,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  templateName: string | null;
  srcDoc: string | null;
  error: string | null;
  editHref: string;
  onDownload: () => void;
  downloading: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={templateName ? `Previewing with the ${templateName} template.` : undefined}
      className="max-w-3xl"
    >
      <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-md border border-cream-dark bg-cream-dark/30 p-3 sm:p-4">
        {srcDoc ? (
          <TemplateFrame srcDoc={srcDoc} title={`${title} preview`} />
        ) : (
          <p role="alert" className="py-10 text-center text-sm text-destructive">
            {error ?? "This preview couldn't be loaded."}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
        <Button variant="outline-olive" onClick={onDownload} disabled={downloading || !srcDoc}>
          {downloading ? (
            <Loader2 data-icon="inline-start" className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
          )}
          Download
        </Button>
        <Link href={editHref} className={buttonClassName({ variant: "primary" })}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Edit
        </Link>
      </div>
    </Dialog>
  );
}
