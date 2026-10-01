import { FileText } from "lucide-react";

function safeThumbnailUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value, "https://resume-builder.invalid");
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return value.startsWith("/") ? `${url.pathname}${url.search}${url.hash}` : url.href;
  } catch {
    return null;
  }
}

export default function TemplateThumbnail({
  name,
  thumbnailUrl,
}: {
  name: string;
  thumbnailUrl: string | null;
}) {
  const imageUrl = safeThumbnailUrl(thumbnailUrl);

  return (
    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
      {imageUrl ? (
        <div
          role="img"
          aria-label={`${name} template preview`}
          className="absolute inset-0 bg-cover bg-top"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center px-1 pt-1.5">
          <FileText className="h-3.5 w-3.5 text-olive" />
          <span className="mt-1.5 flex w-full flex-col gap-1">
            <span className="h-px w-full bg-slate-300" />
            <span className="h-px w-4/5 bg-slate-200" />
            <span className="h-px w-full bg-slate-200" />
            <span className="h-px w-3/5 bg-slate-200" />
          </span>
        </div>
      )}
    </div>
  );
}