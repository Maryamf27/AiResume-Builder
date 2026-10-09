import Select from "@/components/ui/select";
export default function T() {
  return (
    <div className="min-h-screen bg-cream p-4">
      <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Status</span>
        <form className="flex items-center gap-2">
          <Select name="status" defaultValue="new" options={["new","reviewed","resolved"]} capitalize aria-label="Status" className="flex-1" />
          <button type="button" className="h-9 w-9 rounded-lg bg-olive" />
        </form>
      </div>
      <div className="mt-130 max-w-sm rounded-xl border bg-white p-4">
        <Select id="low" defaultValue="reviewed" options={["new","reviewed","resolved"]} capitalize aria-label="Low" />
      </div>
    </div>
  );
}
