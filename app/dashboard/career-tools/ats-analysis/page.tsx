import type { Metadata } from "next";
import CareerAtsResumePicker from "@/components/dashboard/career-ats-resume-picker";

export const metadata: Metadata = { title: "ATS Analysis", robots: { index: false, follow: false } };

export default function CareerATSAnalysisPage() {
  return <CareerAtsResumePicker />;
}
