"use client";

import { useEffect, useState } from "react";
import { getResumeSummaries, type CachedResumeSummary } from "@/lib/resume/client-cache";

export function useResumeSummaries(userId: string) {
  const [result, setResult] = useState<{ userId: string; resumes: CachedResumeSummary[] } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    void getResumeSummaries(userId).then((items) => {
      if (active) { setResult({ userId, resumes: items }); setError(false); }
    }).catch((caught: unknown) => {
      console.error("Could not load resume list:", caught);
      if (active) setError(true);
    });
    return () => { active = false; };
  }, [userId]);
  return { resumes: result?.userId === userId ? result.resumes : null, error: result?.userId === userId && error };
}
