import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ResumeBuilder from "@/components/resume/builder/resume-builder";

export const metadata: Metadata = pageMetadata({
  title: "Resume Builder",
  description:
    "Build your resume for free, no account required. Fill in your details and see a live preview as you type.",
  path: "/builder",
});

export default function BuilderPage() {
  return <ResumeBuilder />;
}
