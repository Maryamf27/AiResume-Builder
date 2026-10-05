"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import Button from "@/components/ui/button";
import FormField from "@/components/resume/forms/form-field";
import EmptyState from "@/components/resume/forms/empty-state";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function ProjectsForm() {
  const { resumeData, addProject, updateProject, removeProject } = useResumeBuilder();
  const entries = resumeData.projects;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const previousCount = useRef(entries.length);

  useEffect(() => {
    const hasNewProject = entries.length > previousCount.current;
    previousCount.current = entries.length;
    if (!hasNewProject) return;

    const frame = window.requestAnimationFrame(() => {
      setExpandedId(entries[entries.length - 1]?.id ?? null);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [entries]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-charcoal">Projects</h2>
        <p className="mt-1 text-sm text-charcoal/60">Show what you&apos;ve built.</p>
      </div>

      {entries.length === 0 && <EmptyState message="No projects added yet." />}

      <div className="flex flex-col gap-3">
        {entries.map((entry, index) => (
          <section key={entry.id} className="overflow-hidden rounded-lg border border-cream-dark bg-cream-light">
            <div className="flex min-w-0 items-center gap-2 p-3">
              <button
                type="button"
                aria-expanded={expandedId === entry.id}
                onClick={() => setExpandedId((current) => current === entry.id ? null : entry.id)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-charcoal">
                    {entry.name || `Project ${index + 1}`}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-charcoal/55">
                    {entry.technologies || entry.description || "Add project details"}
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-charcoal/55 transition-transform ${expandedId === entry.id ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={() => removeProject(entry.id)}
                aria-label={`Remove ${entry.name || `project ${index + 1}`}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-charcoal/45 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-light"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {expandedId === entry.id && (
              <div id={`project-fields-${entry.id}`} className="flex flex-col gap-4 border-t border-cream-dark p-4">
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

                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>
            )}
          </section>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addProject} className="self-start">
        <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
        Add project
      </Button>
    </div>
  );
}