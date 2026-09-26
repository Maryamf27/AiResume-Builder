import type { ReactNode } from "react";
import PublicFooter from "@/components/public/footer";
import PublicHeader from "@/components/public/header";

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
