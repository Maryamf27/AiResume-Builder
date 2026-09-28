"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import EmptyState from "@/components/resume/forms/empty-state";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function SkillsForm() {
  const { resumeData, addSkill, removeSkill } = useResumeBuilder();
  const [draft, setDraft] = useState("");
  const skills = resumeData.skills;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    addSkill(draft);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-xl text-charcoal">Skills</h2>
        <p className="mt-1 text-sm text-charcoal/60">Add the tools and skills you want to highlight.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="React"
          aria-label="New skill"
        />
        <Button type="submit" variant="secondary" disabled={!draft.trim()}>
          <Plus data-icon="inline-start" className="h-4 w-4" aria-hidden="true" />
          Add
        </Button>
      </form>

      {skills.length === 0 ? (
        <EmptyState message="No skills added yet." />
      ) : (
        <ul className="flex flex-wrap gap-2" aria-label="Skills">
          {skills.map((skill) => (
            <li
              key={skill.id}
              className="flex items-center gap-2 rounded-full border border-cream-dark bg-cream-light py-1.5 pl-4 pr-2 text-sm text-charcoal"
            >
              {skill.name}
              <button
                type="button"
                onClick={() => removeSkill(skill.id)}
                aria-label={`Remove ${skill.name}`}
                className="rounded-full p-0.5 text-charcoal/40 transition-colors hover:bg-cream-dark hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
