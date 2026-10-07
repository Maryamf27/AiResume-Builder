"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import TailoringReview from "@/components/resume/tailoring-review";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";
import { TailoringAnalysisSchema, type TailoringAnalysis } from "@/lib/ai/schemas";

const HANDOFF_KEY = "career-tailoring-handoff";

export default function CareerTailoringHandoff() {
  const { hydrated } = useResumeBuilder();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<TailoringAnalysis | null>(null);
  const [checked, setChecked] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!hydrated || checked) return;
    let parsed: unknown = null;
    try {
      const raw = window.sessionStorage.getItem(HANDOFF_KEY);
      if (raw) parsed = JSON.parse(raw);
      window.sessionStorage.removeItem(HANDOFF_KEY);
    } catch {
      window.sessionStorage.removeItem(HANDOFF_KEY);
    }
    const result = TailoringAnalysisSchema.safeParse(parsed);
    if (result.success) setAnalysis(result.data);
    setChecked(true);
  }, [checked, hydrated]);

  if (dismissed) return null;
  if (!checked || !hydrated) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream text-sm text-charcoal/70"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading your selected resume…</div>;
  }

  if (!analysis) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream p-5"><div className="rounded-xl border border-cream-dark bg-white p-6 text-center"><p className="font-semibold text-charcoal">Tailoring review is no longer available.</p><button type="button" className="mt-4 text-sm font-medium text-olive-dark underline" onClick={() => router.push("/dashboard/career-tools/job-analysis")}>Return to Job Analysis</button></div></div>;
  }

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-cream"><TailoringReview analysis={analysis} onBack={() => router.push("/dashboard/career-tools/job-analysis")} onContinueEditing={() => setDismissed(true)} /></div>;
}
