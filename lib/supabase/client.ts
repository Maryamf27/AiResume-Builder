import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

/**
 * Returns the singleton Supabase browser client.
 *
 * Use this in Client Components only. Do NOT call this from Server Components,
 * Server Actions, or Route Handlers — use lib/supabase/server.ts instead.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  return createBrowserClient<Database>(url, anonKey, {
    isSingleton: true,
  });
}
