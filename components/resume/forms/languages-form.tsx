"use client";

import { Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import IconButton from "@/components/ui/icon-button";
import FormField from "@/components/resume/forms/form-field";
import EmptyState from "@/components/resume/forms/empty-state";
import { proficiencyLevels } from "@/lib/resume/constants";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function LanguagesForm() {
  const { resumeData, addLanguage, updateLanguage, removeLanguage } = useResumeBuilder();
  const entries = resumeData.languages;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-charcoal">Languages</h2>
        <p className="mt-1 text-sm text-charcoal/60">Languages you can work in, and how well.</p>
      </div>

      {entries.length === 0 && <EmptyState message="No languages added yet." />}

      <div className="flex flex-col gap-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-3 rounded-lg border border-cream-dark bg-cream-light p-4 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <FormField label="Language" htmlFor={`lang-name-${entry.id}`}>
                <Input
                  id={`lang-name-${entry.id}`}
                  value={entry.language}
                  onChange={(e) => updateLanguage(entry.id, { language: e.target.value })}
                  placeholder="English"
                />
              </FormField>
            </div>
            <div className="flex-1">
              <FormField label="Proficiency" htmlFor={`lang-level-${entry.id}`}>
                <select
                  id={`lang-level-${entry.id}`}
                  value={entry.proficiency}
                  onChange={(e) => updateLanguage(entry.id, { proficiency: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-cream-dark bg-cream-light px-3 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
                >
                  {proficiencyLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <IconButton
              type="button"
              aria-label="Remove language"
              onClick={() => removeLanguage(entry.id)}
              className="self-end text-charcoal/40 hover:text-destructive sm:self-center"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addLanguage} className="self-start">
        <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
        Add language
      </Button>
    </div>
  );
}
