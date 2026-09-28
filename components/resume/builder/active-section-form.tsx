"use client";

import PersonalInfoForm from "@/components/resume/forms/personal-info-form";
import SummaryForm from "@/components/resume/forms/summary-form";
import ExperienceForm from "@/components/resume/forms/experience-form";
import EducationForm from "@/components/resume/forms/education-form";
import SkillsForm from "@/components/resume/forms/skills-form";
import ProjectsForm from "@/components/resume/forms/projects-form";
import CertificationsForm from "@/components/resume/forms/certifications-form";
import LanguagesForm from "@/components/resume/forms/languages-form";
import { useResumeBuilder } from "@/components/resume/builder/resume-builder-context";

export default function ActiveSectionForm() {
  const { activeSection } = useResumeBuilder();

  switch (activeSection) {
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
