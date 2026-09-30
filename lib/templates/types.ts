import type { Template } from "@/types/supabase";

/** The fields the builder needs from a template row. */
export type PublishedTemplate = Pick<
  Template,
  "id" | "name" | "slug" | "category" | "description" | "html" | "css"
>;
