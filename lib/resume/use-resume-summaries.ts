"use client";

import { useEffect, useState } from "react";
import {
  getCachedResumeSummaries,
  getResumeSummaries,
  resumeCacheChangeEvent,
  type CachedResumeSummary,
} from "@/lib/resume/client-cache";

export function useResumeSummaries(userId: string) {
  const [result, setResult] = useState<{ userId: string; resumes: CachedResumeSummary[] } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    const onCacheChange = (event: Event) => {
      const detail = (event as CustomEvent<{ userId: string | null; cleared: boolean }>).detail;
      if (detail.userId !== null && detail.userId !== userId) return;
      if (detail.cleared) {
        setResult((current) => current?.userId === userId ? null : current);
        return;
      }
      const cached = getCachedResumeSummaries(userId);
      if (cached) setResult({ userId, resumes: cached });
    };
    window.addEventListener(resumeCacheChangeEvent, onCacheChange);
    void getResumeSummaries(userId).then((items) => {
      if (active) { setResult({ userId, resumes: items }); setError(false); }
    }).catch((caught: unknown) => {
      console.error("Could not load resume list:", caught);
      if (active) setError(true);
    });
    return () => {
      active = false;
      window.removeEventListener(resumeCacheChangeEvent, onCacheChange);
    };
  }, [userId]);
  return { resumes: result?.userId === userId ? result.resumes : null, error: result?.userId === userId && error };
}
