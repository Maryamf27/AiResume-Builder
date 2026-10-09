import type { Metadata } from "next";
import TemplatesView from "@/components/admin/templates-view";

export const metadata: Metadata = { title: "Templates · Admin" };

export default function AdminTemplatesPage() {
  return <TemplatesView />;
}
