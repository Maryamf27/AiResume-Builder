/** Instant fallback while a dashboard page's code loads; the sidebar stays in place. */
export default function DashboardLoading() {
  return (
    <div className="w-full min-w-0 animate-pulse" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-56 rounded-md bg-cream-dark/70 sm:h-9 sm:w-72" />
      <div className="mt-3 h-4 w-full max-w-md rounded bg-cream-dark/50" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-20 rounded-lg border border-cream-dark bg-cream-light" />
        ))}
      </div>
      <div className="mt-8 space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-16 rounded-lg border border-cream-dark bg-cream-light" />
        ))}
      </div>
    </div>
  );
}
