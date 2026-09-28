"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import PersonalInfoForm from "@/components/resume/forms/personal-info-form";
import SummaryForm from "@/components/resume/forms/summary-form";
import ExperienceForm from "@/components/resume/forms/experience-form";
import EducationForm from "@/components/resume/forms/education-form";
import SkillsForm from "@/components/resume/forms/skills-form";
import ProjectsForm from "@/components/resume/forms/projects-form";
import CertificationsForm from "@/components/resume/forms/certifications-form";
import LanguagesForm from "@/components/resume/forms/languages-form";
import Button from "@/components/ui/button";
import { resumeSections } from "@/lib/resume/constants";
import CompleteDialog from "@/components/resume/builder/complete-dialog";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

function SectionForm({ section }: { section: string }) {
  switch (section) {
    case "personal":
      return <PersonalInfoForm />;
    case "summary":
      return <SummaryForm />;
    case "experience":
      return <ExperienceForm />;
    case "education":
      return <EducationForm />;
    case "skills":
      return <SkillsForm />;
    case "projects":
      return <ProjectsForm />;
    case "certifications":
      return <CertificationsForm />;
    case "languages":
      return <LanguagesForm />;
    default:
      return null;
  }
}

export default function ActiveSectionForm() {
  const { activeSection, setActiveSection } = useResumeBuilder();

  const index = resumeSections.findIndex((s) => s.id === activeSection);
  const prev = index > 0 ? resumeSections[index - 1] : null;
  const next = index >= 0 && index < resumeSections.length - 1 ? resumeSections[index + 1] : null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [completeOpen, setCompleteOpen] = useState(false);

  function go(id: (typeof resumeSections)[number]["id"]) {
    setActiveSection(id);

    // Wait for the next section's form to render, then bring the form itself
    // (not the top of the page) into view and focus its first field.
    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.querySelector<HTMLElement>("input, textarea, select")?.focus({ preventScroll: true });
    });
  }

  return (
    <div ref={containerRef} className="flex scroll-mt-24 flex-col gap-8">
      <SectionForm section={activeSection} />

      <div className="flex items-center justify-between gap-3 border-t border-cream-dark pt-5">
        {prev ? (
          <Button variant="ghost" size="sm" onClick={() => go(prev.id)}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button size="sm" onClick={() => go(next.id)}>
            Next: {next.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button size="sm" onClick={() => setCompleteOpen(true)}>
            <Check className="h-4 w-4" aria-hidden="true" />
            Complete
          </Button>
        )}
      </div>

      <CompleteDialog open={completeOpen} onClose={() => setCompleteOpen(false)} />
    </div>
  );
}