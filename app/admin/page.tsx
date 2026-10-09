import type { Metadata } from "next";
import OverviewView from "@/components/admin/overview-view";

export const metadata: Metadata = { title: "Overview · Admin" };

export default function AdminOverviewPage() {
  return <OverviewView />;
}
