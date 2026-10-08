"use client";

import CreateResumeButton from "@/components/dashboard/create-resume-button";
import { useResumeSummaries } from "@/lib/resume/use-resume-summaries";

export default function CachedCreateResumeButton({ userId }: { userId: string }) {
  const { resumes } = useResumeSummaries(userId);
  return <CreateResumeButton hasSavedResume={Boolean(resumes?.length)} />;
}
