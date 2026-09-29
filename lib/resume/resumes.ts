import { createClient } from "@/lib/supabase/client";
import { DEFAULT_RESUME_TITLE, createEmptyResumeData } from "@/lib/resume/constants";
import type { Json } from "@/types/supabase";
import type { ResumeData } from "@/types/resume";

/** A resume row as the dashboard needs it. */
export interface ResumeListItem {
  id: string;
  title: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

export type ResumeListResult =
  | { ok: true; resumes: ResumeListItem[] }
  | { ok: false; error: string };

/** Every resume the signed-in user owns, newest activity first. */
export async function listResumes(userId: string): Promise<ResumeListResult> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("id, title, data, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    resumes: (data ?? []).map((row) => ({
      id: row.id,
      title: row.title || DEFAULT_RESUME_TITLE,
      data: row.data as unknown as ResumeData,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  };
}


export async function createResume(
  userId: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: userId,
      title: DEFAULT_RESUME_TITLE,
      data: createEmptyResumeData() as unknown as Json,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create the resume." };
  }
  return { ok: true, id: data.id };
}

export async function renameResume(id: string, title: string): Promise<string | null> {
  const trimmed = title.trim() || DEFAULT_RESUME_TITLE;
  const { error } = await createClient()
    .from("resumes")
    .update({ title: trimmed })
    .eq("id", id);
  return error ? error.message : null;
}

export async function deleteResume(id: string): Promise<string | null> {
  const { error } = await createClient().from("resumes").delete().eq("id", id);
  return error ? error.message : null;
}

/** Records a template usage event. Fire-and-forget; never blocks the UI. */
export function recordTemplateEvent(
  templateId: string,
  userId: string | null,
  eventType: "selected" | "downloaded"
): void {
  void createClient()
    .from("template_events")
    .insert({ template_id: templateId, user_id: userId, event_type: eventType })
    .then(({ error }) => {
      if (error) console.warn("Could not record template event:", error.message);
    });
}
