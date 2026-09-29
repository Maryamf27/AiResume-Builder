import type { ResumePersistenceAdapter } from "@/lib/resume/persistence/types";
import { createClient } from "@/lib/supabase/client";
import { sanitizeResumeRecord } from "@/lib/resume/validation";
import type { Json } from "@/types/supabase";
import type { ResumeRecord } from "@/types/resume";

export function createSupabasePersistenceAdapter(userId: string, resumeId?: string): ResumePersistenceAdapter {
  return {
    mode: "authenticated",

    async load() {
      const supabase = createClient();
      let query = supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userId);
      if (resumeId) query = query.eq("id", resumeId);
      const { data, error } = await query
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!data) return null;

      return sanitizeResumeRecord({
        id: data.id,
        userId: data.user_id,
        title: data.title,
        data: data.data,
        version: 1,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      });
    },

    async save(record: ResumeRecord) {
      const supabase = createClient();
      const { error } = await supabase.from("resumes").upsert(
        {
          id: record.id,
          user_id: userId,
          title: record.title,
          data: record.data as unknown as Json,
        },
        { onConflict: "id" }
      );

      if (error) {
        return { ok: false as const, error: error.message };
      }
      return { ok: true as const };
    },
  };
}
