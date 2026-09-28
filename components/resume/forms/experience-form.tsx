"use client";

import { Plus } from "lucide-react";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import FormField from "@/components/resume/forms/form-field";
import EntryCard from "@/components/resume/forms/entry-card";
import EmptyState from "@/components/resume/forms/empty-state";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function ExperienceForm() {
  const { resumeData, addExperience, updateExperience, removeExperience } = useResumeBuilder();
  const entries = resumeData.experience;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl text-charcoal">Experience</h2>
          <p className="mt-1 text-sm text-charcoal/60">Add roles, most recent first.</p>
        </div>
      </div>

      {entries.length === 0 && (
        <EmptyState message="No experience added yet. Add your most recent role to get started." />
      )}

      <div className="flex flex-col gap-4">
        {entries.map((entry, index) => (
          <EntryCard
            key={entry.id}
            title={entry.jobTitle || entry.company ? `${entry.jobTitle || "Untitled role"}${entry.company ? ` · ${entry.company}` : ""}` : `Experience ${index + 1}`}
            onRemove={() => removeExperience(entry.id)}
            removeLabel="Remove experience entry"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Job title" htmlFor={`exp-title-${entry.id}`}>
                <Input
                  id={`exp-title-${entry.id}`}
                  value={entry.jobTitle}
                  onChange={(e) => updateExperience(entry.id, { jobTitle: e.target.value })}
                  placeholder="Frontend Developer"
                />
              </FormField>
              <FormField label="Company" htmlFor={`exp-company-${entry.id}`}>
                <Input
                  id={`exp-company-${entry.id}`}
                  value={entry.company}
                  onChange={(e) => updateExperience(entry.id, { company: e.target.value })}
                  placeholder="Acme Inc."
                />
              </FormField>
            </div>

            <FormField label="Location" htmlFor={`exp-location-${entry.id}`} optional>
              <Input
                id={`exp-location-${entry.id}`}
                value={entry.location}
                onChange={(e) => updateExperience(entry.id, { location: e.target.value })}
                placeholder="Multan, Pakistan · Remote"
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Start date" htmlFor={`exp-start-${entry.id}`}>
                <Input
                  id={`exp-start-${entry.id}`}
                  type="month"
                  value={entry.startDate}
                  onChange={(e) => updateExperience(entry.id, { startDate: e.target.value })}
                />
              </FormField>
              <FormField label="End date" htmlFor={`exp-end-${entry.id}`}>
                <Input
                  id={`exp-end-${entry.id}`}
                  type="month"
                  value={entry.endDate}
                  onChange={(e) => updateExperience(entry.id, { endDate: e.target.value })}
                  disabled={entry.current}
                  placeholder={entry.current ? "Present" : undefined}
                />
              </FormField>
            </div>

            <label className="flex items-center gap-2 text-sm text-charcoal/75">
              <input
                type="checkbox"
                checked={entry.current}
                onChange={(e) =>
                  updateExperience(entry.id, {
                    current: e.target.checked,
                    endDate: e.target.checked ? "" : entry.endDate,
                  })
                }
                className="h-4 w-4 rounded border-cream-dark text-olive focus-visible:ring-2 focus-visible:ring-olive-light"
              />
              I currently work here
            </label>

            <FormField label="Description" htmlFor={`exp-desc-${entry.id}`} optional>
              <Textarea
                id={`exp-desc-${entry.id}`}
                rows={4}
                value={entry.description}
                onChange={(e) => updateExperience(entry.id, { description: e.target.value })}
                placeholder="Led the redesign of the checkout flow, reducing drop-off by 18%…"
              />
            </FormField>
          </EntryCard>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addExperience} className="self-start">
        <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
        Add experience
      </Button>
    </div>
  );
}
