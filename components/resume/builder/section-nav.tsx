"use client";

import { resumeSections } from "@/lib/resume/constants";
import { cn } from "@/lib/utils";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function SectionNav() {
  const { activeSection, setActiveSection, resumeData } = useResumeBuilder();

  return (
    <nav aria-label="Resume sections" className="flex flex-col gap-1">
      {resumeSections.map((section) => {
        const Icon = section.icon;
        const isActive = section.id === activeSection;
        const count = sectionCount(section.id, resumeData.experience.length, resumeData.education.length, resumeData.skills.length, resumeData.projects.length, resumeData.certifications.length, resumeData.languages.length);

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
              isActive
                ? "bg-olive text-cream"
                : "text-charcoal/75 hover:bg-cream-dark/60"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 font-medium">{section.label}</span>
            {count !== null && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs tabular-nums",
                  isActive ? "bg-cream/20 text-cream" : "bg-cream-dark text-charcoal/60"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function sectionCount(
  id: string,
  experience: number,
  education: number,
  skills: number,
  projects: number,
  certifications: number,
  languages: number
): number | null {
  switch (id) {
    case "experience":
      return experience;
    case "education":
      return education;
    case "skills":
      return skills;
    case "projects":
      return projects;
    case "certifications":
      return certifications;
    case "languages":
      return languages;
    default:
      return null;
  }
}
