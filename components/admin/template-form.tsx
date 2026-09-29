"use client";

import { useActionState, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import Button, { buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TemplateFrame from "@/components/templates/template-frame";
import { renderTemplateDocument, checkTemplateSyntax } from "@/lib/templates/render";
import { sampleResume } from "@/lib/templates/sample-data";
import { STARTER_CSS, STARTER_HTML } from "@/lib/templates/starter-template";
import type { TemplateFormState } from "@/app/admin/templates/actions";

export interface TemplateFormValues {
  name: string;
  slug: string;
  description: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
  html: string;
  css: string;
}

export const emptyTemplateValues: TemplateFormValues = {
  name: "",
  slug: "",
  description: "",
  category: "",
  sortOrder: 0,
  isPublished: false,
  html: STARTER_HTML,
  css: STARTER_CSS,
};

const initialState: TemplateFormState = { error: null };

function Label({ htmlFor, children, hint }: { htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-charcoal">
      {children}
      {hint && <span className="ml-1 font-normal text-charcoal/50">{hint}</span>}
    </label>
  );
}

export default function TemplateForm({
  action,
  initial = emptyTemplateValues,
  submitLabel,
}: {
  action: (prev: TemplateFormState, formData: FormData) => Promise<TemplateFormState>;
  initial?: TemplateFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [html, setHtml] = useState(initial.html);
  const [css, setCss] = useState(initial.css);

  const deferredHtml = useDeferredValue(html);
  const deferredCss = useDeferredValue(css);

  const preview = useMemo(() => {
    const problem = checkTemplateSyntax(deferredHtml);
    if (problem) return { doc: null, problem };
    try {
      return {
        doc: renderTemplateDocument({ html: deferredHtml, css: deferredCss }, sampleResume),
        problem: null,
      };
    } catch (err) {
      return { doc: null, problem: err instanceof Error ? err.message : "Could not render." };
    }
  }, [deferredHtml, deferredCss]);

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        {state.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required maxLength={80} defaultValue={initial.name} />
          </div>
          <div>
            <Label htmlFor="slug" hint="(auto from name)">Slug</Label>
            <Input id="slug" name="slug" defaultValue={initial.slug} placeholder="editorial" />
          </div>
          <div>
            <Label htmlFor="category" hint="(optional)">Category</Label>
            <Input id="category" name="category" defaultValue={initial.category} placeholder="Modern" />
          </div>
          <div>
            <Label htmlFor="sort_order" hint="(lower shows first)">Order</Label>
            <Input id="sort_order" name="sort_order" type="number" defaultValue={initial.sortOrder} />
          </div>
        </div>

        <div>
          <Label htmlFor="description" hint="(optional)">Description</Label>
          <Input id="description" name="description" defaultValue={initial.description} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="html" className="text-sm font-medium text-charcoal">HTML</label>
            <button
              type="button"
              className="text-xs text-olive underline underline-offset-2"
              onClick={() => {
                setHtml(STARTER_HTML);
                setCss(STARTER_CSS);
              }}
            >
              Reset to starter template
            </button>
          </div>
          <Textarea
            id="html"
            name="html"
            rows={16}
            required
            spellCheck={false}
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="font-mono text-xs leading-5"
          />
        </div>

        <div>
          <Label htmlFor="css">CSS</Label>
          <Textarea
            id="css"
            name="css"
            rows={12}
            spellCheck={false}
            value={css}
            onChange={(e) => setCss(e.target.value)}
            className="font-mono text-xs leading-5"
          />
          <p className="mt-1.5 text-xs text-charcoal/55">
            Use system font stacks (Georgia, Helvetica, Arial…). External fonts, images and @import
            are blocked; embed images as data: URIs.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-charcoal">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={initial.isPublished}
            className="h-4 w-4 accent-[var(--color-olive,#4a6b53)]"
          />
          Published (visible to users)
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {submitLabel}
          </Button>
          <Link href="/admin/templates" className={buttonClassName({ variant: "ghost" })}>
            Cancel
          </Link>
        </div>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-sm font-medium text-charcoal">Live preview (sample resume)</p>
        {preview.doc ? (
          <TemplateFrame srcDoc={preview.doc} />
        ) : (
          <div role="status" className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {preview.problem}
          </div>
        )}
      </div>
    </form>
  );
}
