import type { Metadata } from "next";
import UsersView from "@/components/admin/users-view";

export const metadata: Metadata = { title: "Users · Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <UsersView initialQuery={q ?? ""} />;
}
