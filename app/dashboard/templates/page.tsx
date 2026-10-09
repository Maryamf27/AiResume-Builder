import type { Metadata } from "next";
import TemplatesView from "@/components/dashboard/templates-view";

export const metadata: Metadata = {
  title: "Templates",
  robots: { index: false, follow: false },
};

export default function DashboardTemplatesPage() {
  return <TemplatesView />;
}
