import type { Metadata } from "next";
import CareerJobAnalysis from "@/components/dashboard/career-job-analysis";

export const metadata: Metadata = { title: "Job Analysis", robots: { index: false, follow: false } };

export default function CareerJobAnalysisPage() {
  return <CareerJobAnalysis />;
}
