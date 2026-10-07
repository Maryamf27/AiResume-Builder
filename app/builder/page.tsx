import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ResumeBuilder from "@/components/resume/builder/resume-builder";

export const metadata: Metadata = pageMetadata({
  title: "Resume Builder",
  description:
    "Build your resume for free, no account required. Fill in your details and see a live preview as you type.",
  path: "/builder",
});

export default async function BuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; template?: string; new?: string; panel?: string; careerTailoring?: string }>;
}) {
  const { id, template, new: startNew, panel, careerTailoring } = await searchParams;
  return (
    <ResumeBuilder
      resumeId={id}
      initialTemplateSlug={template}
      startNew={startNew === "1"}
      initialPanel={panel === "ats" ? "ats" : null}
      careerTailoring={careerTailoring === "1"}
    />
  );
}
