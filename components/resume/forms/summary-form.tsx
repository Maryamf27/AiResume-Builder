"use client";

import Textarea from "@/components/ui/textarea";
import FormField from "@/components/resume/forms/form-field";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function SummaryForm() {
  const { resumeData, updateSummary } = useResumeBuilder();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-charcoal">Professional Summary</h2>
        <p className="mt-1 text-sm text-charcoal/60">
          Write 2–4 concise sentences describing your professional background, strengths, and
          career focus.
        </p>
      </div>

      <FormField label="Summary" htmlFor="summary" optional>
        <Textarea
          id="summary"
          rows={7}
          maxLength={800}
          value={resumeData.summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="Frontend developer with 4 years of experience building accessible, performant web applications with React and TypeScript…"
        />
      </FormField>
      <p className="text-xs text-charcoal/45">{resumeData.summary.length} / 800 characters</p>
    </div>
  );
}
