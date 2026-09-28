"use client";

import { Plus } from "lucide-react";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import FormField from "@/components/resume/forms/form-field";
import EntryCard from "@/components/resume/forms/entry-card";
import EmptyState from "@/components/resume/forms/empty-state";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function ProjectsForm() {
  const { resumeData, addProject, updateProject, removeProject } = useResumeBuilder();
  const entries = resumeData.projects;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-charcoal">Projects</h2>
        <p className="mt-1 text-sm text-charcoal/60">Show what you&apos;ve built.</p>
      </div>

      {entries.length === 0 && <EmptyState message="No projects added yet." />}

      <div className="flex flex-col gap-4">
        {entries.map((entry, index) => (
          <EntryCard
            key={entry.id}
            title={entry.name || `Project ${index + 1}`}
            onRemove={() => removeProject(entry.id)}
            removeLabel="Remove project entry"
          >
            <FormField label="Project name" htmlFor={`proj-name-${entry.id}`}>
              <Input
                id={`proj-name-${entry.id}`}
                value={entry.name}
                onChange={(e) => updateProject(entry.id, { name: e.target.value })}
                placeholder="Resonance Resume Builder"
              />
            </FormField>

            <FormField label="Description" htmlFor={`proj-desc-${entry.id}`} optional>
              <Textarea
                id={`proj-desc-${entry.id}`}
                rows={3}
                value={entry.description}
                onChange={(e) => updateProject(entry.id, { description: e.target.value })}
                placeholder="A guest-first resume builder with live preview and local autosave."
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Project URL" htmlFor={`proj-url-${entry.id}`} optional>
                <Input
                  id={`proj-url-${entry.id}`}
                  type="url"
                  value={entry.url}
                  onChange={(e) => updateProject(entry.id, { url: e.target.value })}
                  placeholder="https://project.example.com"
                />
              </FormField>
              <FormField label="Technologies" htmlFor={`proj-tech-${entry.id}`} optional>
                <Input
                  id={`proj-tech-${entry.id}`}
                  value={entry.technologies}
                  onChange={(e) => updateProject(entry.id, { technologies: e.target.value })}
                  placeholder="React, TypeScript, Supabase"
                />
              </FormField>
            </div>
          </EntryCard>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addProject} className="self-start">
        <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
        Add project
      </Button>
    </div>
  );
}
