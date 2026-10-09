import { createClient } from "@/lib/supabase/client";


export const adminKeys = {
  all: ["admin"] as const,
  overview: ["admin", "overview"] as const,
  users: ["admin", "users"] as const,
  templates: ["admin", "templates"] as const,
  feedback: ["admin", "feedback"] as const,
};

export async function fetchAdminOverview() {
  const supabase = createClient();
  const [summaryRes, usageRes, dailyRes, usersRes] = await Promise.all([
    supabase.rpc("admin_summary"),
    supabase.rpc("admin_template_usage"),
    supabase.rpc("admin_daily_activity", { days: 14 }),
    supabase.rpc("admin_user_overview"),
  ]);
  const error = summaryRes.error ?? usageRes.error ?? dailyRes.error ?? usersRes.error;
  if (error) throw new Error(error.message);
  return {
    summary: summaryRes.data?.[0],
    usage: usageRes.data ?? [],
    daily: dailyRes.data ?? [],
    users: usersRes.data ?? [],
  };
}

export async function fetchAdminUsers() {
  const { data, error } = await createClient().rpc("admin_user_overview");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchAdminTemplates() {
  const supabase = createClient();
  const [usageRes, templatesRes] = await Promise.all([
    supabase.rpc("admin_template_usage"),
    supabase
      .from("templates")
      .select("id, name, slug, thumbnail_url, is_published, sort_order, updated_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);
  if (templatesRes.error) throw new Error(templatesRes.error.message);
  return { templates: templatesRes.data ?? [], usage: usageRes.data ?? [] };
}

export async function fetchAdminFeedback() {
  const supabase = createClient();
  const [feedbackRes, profilesRes] = await Promise.all([
    supabase
      .from("feedback")
      .select("id, user_id, type, message, page_url, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, email"),
  ]);
  if (feedbackRes.error) throw new Error(feedbackRes.error.message);
  return { rows: feedbackRes.data ?? [], profiles: profilesRes.data ?? [] };
}

export type AdminTemplatesData = Awaited<ReturnType<typeof fetchAdminTemplates>>;
export type AdminFeedbackData = Awaited<ReturnType<typeof fetchAdminFeedback>>;

export const adminQueryOptions = {
  overview: { queryKey: adminKeys.overview, queryFn: fetchAdminOverview },
  users: { queryKey: adminKeys.users, queryFn: fetchAdminUsers },
  templates: { queryKey: adminKeys.templates, queryFn: fetchAdminTemplates },
  feedback: { queryKey: adminKeys.feedback, queryFn: fetchAdminFeedback },
} as const;
