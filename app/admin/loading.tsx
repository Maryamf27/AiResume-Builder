import AdminPageSkeleton from "@/components/admin/page-skeleton";

/** Instant fallback while a server-rendered admin page (e.g. template editor) streams in. */
export default function AdminLoading() {
  return <AdminPageSkeleton />;
}
