import type { Template } from "@/types/supabase";

export type PublishedTemplate = Pick<
  Template,
  "id" | "name" | "slug" | "category" | "description" | "html" | "css"
>;
