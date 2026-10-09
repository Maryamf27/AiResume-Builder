"use client";

import { useQuery } from "@tanstack/react-query";
import { resumeListQueryOptions } from "@/lib/resume/client-cache";

/** Same shape as before: `resumes` is null until the first load, `error` only if nothing is cached. */
export function useResumeSummaries(userId: string) {
  const { data, isError } = useQuery(resumeListQueryOptions(userId));
  return { resumes: data ?? null, error: isError && !data };
}
