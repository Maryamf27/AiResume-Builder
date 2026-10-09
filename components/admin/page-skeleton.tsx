/** Placeholder shown only the first time an admin page has no cached data yet. */
export default function AdminPageSkeleton() {
  return (
    <div className="w-full min-w-0 animate-pulse" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-48 rounded-md bg-cream-dark/70 sm:h-9 sm:w-64" />
      <div className="mt-3 h-4 w-full max-w-md rounded bg-cream-dark/50" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-20 rounded-lg border border-cream-dark bg-cream-light sm:h-24" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="h-64 rounded-lg border border-cream-dark bg-cream-light" />
        <div className="h-64 rounded-lg border border-cream-dark bg-cream-light" />
      </div>
    </div>
  );
}
