"use client";

import { useActionState, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, Check, Copy, Loader2 } from "lucide-react";
import Button, { buttonClassName } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import TemplateFrame from "@/components/templates/template-frame";
import { checkTemplateCss, checkTemplateSyntax, checkTemplateVariables, renderTemplateDocument } from "@/lib/templates/render";
import { sampleResume } from "@/lib/templates/sample-data";
import { enhanceTemplateDesignPrompt } from "@/lib/templates/prompt-enhancer";
import type { TemplateFormState } from "@/app/admin/templates/actions";

const initialState: TemplateFormState = { error: null };
export default function TemplateCreatorForm({ action }: { action: (prev: TemplateFormState, formData: FormData) => Promise<TemplateFormState> }) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const previewHtml = useDeferredValue(html);
  const previewCss = useDeferredValue(css);
  const validation = useMemo(() => {
    if (!previewHtml.trim()) return { issues: ["Paste the generated HTML to preview and validate it."], doc: null };
    const issues = [checkTemplateSyntax(previewHtml), checkTemplateVariables(previewHtml), checkTemplateCss(previewCss)].filter((item): item is string => Boolean(item));
    if (previewHtml.length > 200_000) issues.push("Template HTML is too large (200 KB max).");
    if (previewCss.length > 100_000) issues.push("Template CSS is too large (100 KB max).");
    if (issues.length) return { issues, doc: null };
    try {
      return { issues, doc: renderTemplateDocument({ html: previewHtml, css: previewCss }, sampleResume) };
    } catch (error) {
      return { issues: [error instanceof Error ? error.message : "Could not render this template."], doc: null };
    }
  }, [previewHtml, previewCss]);

  async function copyPrompt() {
    const text = enhanceTemplateDesignPrompt(prompt);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopyError("Clipboard access failed. Select and copy the prompt manually.");
    }
  }

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-5">
        {state.error && <div role="alert" className="flex gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4 shrink-0" />{state.error}</div>}
        <div>
          <label htmlFor="prompt" className="mb-1.5 block text-sm font-medium text-charcoal">Describe the template design</label>
          <Textarea id="prompt" name="prompt" required minLength={8} maxLength={4000} rows={5} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="For example: A clean, compact, ATS-friendly software engineer resume with a strong name header, restrained navy accents, and clear sections." />
          <div className="mt-2 flex items-center gap-3">
            <Button type="button" variant="secondary" disabled={prompt.trim().length < 8} onClick={copyPrompt}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy Prompt"}
            </Button>
            <span className="text-xs text-charcoal/60">Use the copied instructions with your external AI, then paste its HTML and CSS below.</span>
          </div>
          {copyError && <p role="alert" className="mt-2 text-sm text-destructive">{copyError}</p>}
        </div>
        <div>
          <label htmlFor="html" className="mb-1.5 block text-sm font-medium text-charcoal">Generated HTML</label>
          <Textarea id="html" name="html" required rows={14} spellCheck={false} value={html} onChange={(event) => setHtml(event.target.value)} className="font-mono text-xs leading-5" placeholder="Paste only the resume body markup. Use the exact Mustache placeholders listed in the copied prompt." />
        </div>
        <div>
          <label htmlFor="css" className="mb-1.5 block text-sm font-medium text-charcoal">Generated CSS</label>
          <Textarea id="css" name="css" rows={12} spellCheck={false} value={css} onChange={(event) => setCss(event.target.value)} className="font-mono text-xs leading-5" placeholder="Paste the CSS rules here." />
        </div>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className={validation.issues.length ? "font-medium text-destructive" : "font-medium text-olive"}>{validation.issues.length ? "Template needs changes" : "Template is valid and ready to save"}</p>
          {validation.issues.length > 0 && <ul className="mt-1 list-disc pl-5 text-charcoal/75">{validation.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>}
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending || validation.issues.length > 0 || prompt.trim().length < 8}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}Save Template
          </Button>
          <Link href="/admin/templates" className={buttonClassName({ variant: "ghost" })}>Cancel</Link>
        </div>
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-sm font-medium text-charcoal">Live preview (sample resume)</p>
        {validation.doc ? <TemplateFrame srcDoc={validation.doc} /> : <div role="status" className="rounded-md border border-border bg-muted/40 p-4 text-sm text-charcoal/70">{html.trim() ? "Fix the validation issues to see a preview." : "Your rendered resume preview will appear here."}</div>}
      </div>
    </form>
  );
}
