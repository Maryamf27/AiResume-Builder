import type { Metadata } from "next";
import FeedbackView from "@/components/admin/feedback-view";

export const metadata: Metadata = { title: "Feedback · Admin" };

export default function FeedbackAdminPage() {
  return <FeedbackView />;
}
