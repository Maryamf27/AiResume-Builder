import type { ReactNode } from "react";
import PublicFooter from "@/components/public/footer";
import PublicHeader from "@/components/public/header";
import { getOptionalAuthInfo } from "@/lib/auth/session";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = await getOptionalAuthInfo();
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream">
      <PublicHeader auth={auth} />
      <div className="flex-1 w-full">{children}</div>
      <PublicFooter />
    </div>
  );
}
