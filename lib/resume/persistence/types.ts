import type { ResumeRecord } from "@/types/resume";

export type SaveResult = { ok: true } | { ok: false; error: string };

export interface ResumePersistenceAdapter {
  mode: "guest" | "authenticated";
  load(): Promise<ResumeRecord | null>;
  save(record: ResumeRecord): Promise<SaveResult>;
}
