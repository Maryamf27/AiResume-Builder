export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-cream-dark bg-cream-light/60 px-5 py-8 text-center">
      <p className="text-sm text-charcoal/55">{message}</p>
    </div>
  );
}
