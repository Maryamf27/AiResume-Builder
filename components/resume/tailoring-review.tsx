"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";
import type { TailoringAnalysis, TailoringChange } from "@/lib/ai/schemas";

const sectionOrder = ["summary", "experience", "projects", "education"] as const;
type ReviewSection = (typeof sectionOrder)[number];

const sectionLabels: Record<ReviewSection, string> = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
};

function getCurrentValue(change: TailoringChange, resumeData: ReturnType<typeof useResumeBuilder>["resumeData"]): string | null {
  if (change.section === "summary" && change.field === "summary" && change.itemId === null) {
    return resumeData.summary;
  }
  if (!change.itemId) return null;

  if (change.section === "experience" && change.field === "description") {
    return resumeData.experience.find((entry) => entry.id === change.itemId)?.description ?? null;
  }
  if (change.section === "projects" && change.field === "description") {
    return resumeData.projects.find((entry) => entry.id === change.itemId)?.description ?? null;
  }
  if (change.section === "projects" && change.field === "technologies") {
    return resumeData.projects.find((entry) => entry.id === change.itemId)?.technologies ?? null;
  }
  if (change.section === "education" && change.field === "description") {
    return resumeData.education.find((entry) => entry.id === change.itemId)?.description ?? null;
  }
  return null;
}

function ExpandableText({ value, label }: { value: string; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = value.length > 260;

  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal/55">{label}</p>
      <p className={`mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-charcoal/80 ${!expanded && isLong ? "line-clamp-5" : ""}`}>
        {value || "—"}
      </p>
      {isLong && (
        <button
          type="button"
          className="mt-1 text-xs font-medium text-olive-dark underline-offset-2 hover:underline"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

export default function TailoringReview({
  analysis,
  onBack,
  onContinueEditing,
}: {
  analysis: TailoringAnalysis;
  onBack: () => void;
  onContinueEditing: () => void;
}) {
  const { resumeData, applyTailoringChanges } = useResumeBuilder();
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  const eligibility = useMemo(() => {
    const ids = new Map<string, number>();
    const targets = new Map<string, number>();
    analysis.changes.forEach((change) => {
      ids.set(change.id, (ids.get(change.id) ?? 0) + 1);
      const target = `${change.section}:${change.itemId ?? "summary"}:${change.field}`;
      targets.set(target, (targets.get(target) ?? 0) + 1);
    });

    return analysis.changes.map((change) => {
      const target = `${change.section}:${change.itemId ?? "summary"}:${change.field}`;
      const currentValue = getCurrentValue(change, resumeData);
      const validShape =
        (change.section === "summary" && change.field === "summary" && change.itemId === null) ||
        (change.section === "experience" && change.field === "description" && Boolean(change.itemId)) ||
        (change.section === "projects" && ["description", "technologies"].includes(change.field) && Boolean(change.itemId)) ||
        (change.section === "education" && change.field === "description" && Boolean(change.itemId));
      const eligible =
        change.supportedByResume &&
        validShape &&
        Boolean(change.suggestedValue.trim()) &&
        change.suggestedValue !== change.currentValue &&
        ids.get(change.id) === 1 &&
        targets.get(target) === 1 &&
        currentValue === change.currentValue;

      return {
        eligible,
        reason: !change.supportedByResume
          ? "This suggestion needs verification and cannot be applied automatically."
          : currentValue !== change.currentValue
            ? "Your resume field has changed since this suggestion was generated."
            : !validShape || ids.get(change.id) !== 1 || targets.get(target) !== 1
              ? "This suggestion has an invalid or duplicate target."
              : null,
      };
    });
  }, [analysis.changes, resumeData]);

  const eligibleIndexes = eligibility.flatMap((item, index) => item.eligible ? [index] : []);
  const selectedCount = selected.size;
  const allSelected = eligibleIndexes.length > 0 && eligibleIndexes.every((index) => selected.has(index));

  const toggleSelection = (index: number) => {
    setError(null);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const applySelected = () => {
    const changes = [...selected].sort((a, b) => a - b).map((index) => analysis.changes[index]);
    const result = applyTailoringChanges(changes);
    setConfirmOpen(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    setError(null);
    setAppliedCount(result.appliedCount);
  };

  if (appliedCount !== null) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-3xl items-center px-4 py-8 sm:px-8">
        <section className="w-full rounded-2xl border border-cream-dark bg-white p-6 text-center shadow-sm sm:p-10">
          <CheckCircle2 className="mx-auto h-12 w-12 text-olive" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold text-charcoal">Changes applied</h1>
          <p className="mt-2 text-sm leading-6 text-charcoal/65">
            {appliedCount} selected change{appliedCount === 1 ? " was" : "s were"} added to your resume. You can continue editing them now.
          </p>
          <Button type="button" variant="primary" className="mt-6" onClick={onContinueEditing}>
            Continue Editing
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-36 pt-5 sm:px-8 sm:pb-32 sm:pt-7 lg:px-10">
      <Button type="button" variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to suggestions
      </Button>

      <header className="mb-5 mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/55">Review & Apply</p>
        <h1 className="mt-1 text-2xl font-semibold text-charcoal sm:text-3xl">Choose the changes you want</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-charcoal/65">
          Nothing changes until you confirm. Only suggestions grounded in your resume and still matching the original text can be applied.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cream-dark bg-white p-4">
        <p className="text-sm text-charcoal/70">
          <span className="font-semibold text-charcoal">{selectedCount}</span> selected · {eligibleIndexes.length} applicable of {analysis.changes.length} suggestions
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={eligibleIndexes.length === 0}
            onClick={() => {
              setError(null);
              setSelected(allSelected ? new Set() : new Set(eligibleIndexes));
            }}
          >
            {allSelected ? "Clear all" : "Select all"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {sectionOrder.map((section) => {
          const entries = analysis.changes
            .map((change, index) => ({ change, index }))
            .filter(({ change }) => change.section === section);
          if (entries.length === 0) return null;

          return (
            <details key={section} open className="overflow-hidden rounded-xl border border-cream-dark bg-white">
              <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-charcoal marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  <span>{sectionLabels[section]}</span>
                  <span className="text-xs font-normal text-charcoal/55">{entries.length} change{entries.length === 1 ? "" : "s"}</span>
                </span>
              </summary>
              <ul className="space-y-3 border-t border-cream-dark p-3 sm:p-4">
                {entries.map(({ change, index }) => {
                  const canSelect = eligibility[index].eligible;
                  return (
                    <li key={`${change.id}-${index}`} className="min-w-0 rounded-lg border border-cream-dark bg-cream-light/50 p-3 sm:p-4">
                      <label className={`flex items-start gap-3 ${canSelect ? "cursor-pointer" : "cursor-not-allowed"}`}>
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 shrink-0 accent-olive"
                          checked={selected.has(index)}
                          disabled={!canSelect}
                          onChange={() => toggleSelection(index)}
                          aria-label={`Select ${sectionLabels[section]} change`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-charcoal">{change.field === "technologies" ? "Technologies" : sectionLabels[section]}</span>
                            <span className="rounded-full border border-cream-dark px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-charcoal/60">{change.priority}</span>
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-charcoal/65">{change.reason}</span>
                        </span>
                      </label>
                      <div className="mt-3 grid min-w-0 gap-3 border-t border-cream-dark pt-3 md:grid-cols-2">
                        <ExpandableText value={change.currentValue} label="Current text" />
                        <ExpandableText value={change.suggestedValue} label="Suggested text" />
                      </div>
                      {!canSelect && (
                        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-800">
                          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {eligibility[index].reason ?? "This suggestion is not currently applicable."} It will not be applied.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-cream-dark bg-cream-light/95 px-4 py-3 shadow-[0_-8px_24px_rgba(40,35,25,0.08)] backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-charcoal/70">{selectedCount} change{selectedCount === 1 ? "" : "s"} selected</p>
          <Button type="button" variant="primary" disabled={selectedCount === 0} onClick={() => setConfirmOpen(true)}>
            Apply {selectedCount} {selectedCount === 1 ? "Change" : "Changes"}
          </Button>
        </div>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Apply selected changes?"
        description={`This will update ${selectedCount} selected field${selectedCount === 1 ? "" : "s"} in your resume. You can edit them afterward.`}
      >
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button type="button" variant="primary" onClick={applySelected}>Confirm & Apply</Button>
        </div>
      </Dialog>
    </main>
  );
}
