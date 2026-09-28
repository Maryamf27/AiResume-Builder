"use client";

import { Plus } from "lucide-react";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import FormField from "@/components/resume/forms/form-field";
import EntryCard from "@/components/resume/forms/entry-card";
import EmptyState from "@/components/resume/forms/empty-state";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function EducationForm() {
  const { resumeData, addEducation, updateEducation, removeEducation } = useResumeBuilder();
  const entries = resumeData.education;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-charcoal">Education</h2>
        <p className="mt-1 text-sm text-charcoal/60">Add your degrees, most recent first.</p>
      </div>

      {entries.length === 0 && (
        <EmptyState message="No education added yet. Add your most recent degree to get started." />
      )}

      <div className="flex flex-col gap-4">
        {entries.map((entry, index) => (
          <EntryCard
            key={entry.id}
            title={entry.institution || entry.degree ? `${entry.degree || "Untitled"}${entry.institution ? ` · ${entry.institution}` : ""}` : `Education ${index + 1}`}
            onRemove={() => removeEducation(entry.id)}
            removeLabel="Remove education entry"
          >
            <FormField label="Institution" htmlFor={`edu-institution-${entry.id}`}>
              <Input
                id={`edu-institution-${entry.id}`}
                value={entry.institution}
                onChange={(e) => updateEducation(entry.id, { institution: e.target.value })}
                placeholder="Bahauddin Zakariya University"
              />
            </FormField>

            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
              <FormField label="Degree" htmlFor={`edu-degree-${entry.id}`}>
                <Input
                  id={`edu-degree-${entry.id}`}
                  value={entry.degree}
                  onChange={(e) => updateEducation(entry.id, { degree: e.target.value })}
                  placeholder="Bachelor of Science"
                />
              </FormField>
              <FormField label="Field of study" htmlFor={`edu-field-${entry.id}`} optional>
                <Input
                  id={`edu-field-${entry.id}`}
                  value={entry.fieldOfStudy}
                  onChange={(e) => updateEducation(entry.id, { fieldOfStudy: e.target.value })}
                  placeholder="Computer Science"
                />
              </FormField>
            </div>

            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
              <FormField label="Start date" htmlFor={`edu-start-${entry.id}`} optional>
                <Input
                  id={`edu-start-${entry.id}`}
                  type="month"
                  value={entry.startDate}
                  onChange={(e) => updateEducation(entry.id, { startDate: e.target.value })}
                />
              </FormField>
              <FormField label="End date" htmlFor={`edu-end-${entry.id}`} optional>
                <Input
                  id={`edu-end-${entry.id}`}
                  type="month"
                  value={entry.endDate}
                  onChange={(e) => updateEducation(entry.id, { endDate: e.target.value })}
                />
              </FormField>
            </div>

            <FormField label="Description" htmlFor={`edu-desc-${entry.id}`} optional>
              <Textarea
                id={`edu-desc-${entry.id}`}
                rows={3}
                value={entry.description}
                onChange={(e) => updateEducation(entry.id, { description: e.target.value })}
                placeholder="Relevant coursework, honors, activities…"
              />
            </FormField>
          </EntryCard>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addEducation} className="self-start">
        <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
        Add education
      </Button>
    </div>
  );
}