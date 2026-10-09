import type { Metadata } from "next";
import ResumesView from "@/components/dashboard/resumes-view";

export const metadata: Metadata = {
  title: "My Resumes",
  robots: { index: false, follow: false },
};

export default function MyResumesPage() {
  return <ResumesView />;
}
