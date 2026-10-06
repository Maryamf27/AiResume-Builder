import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { withScopedAIResultCache } from "@/lib/ai/result-cache";

export async function getAIUserScope(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) return `user:${user.id}`;
    } catch {
      // Avoid using a guest scope if auth lookup failed; it could reuse another session's cache.
      return null;
    }
  }
  try {
    const cookieStore = await cookies();
    let guestScope = cookieStore.get("ai_cache_scope")?.value;
    if (!guestScope || !/^[0-9a-f-]{36}$/i.test(guestScope)) {
      guestScope = randomUUID();
      cookieStore.set("ai_cache_scope", guestScope, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    return `guest:${guestScope}`;
  } catch {
    return null;
  }
}

export async function withAICache<T>(
  userScope: string | null,
  operation: string,
  input: unknown,
  run: () => Promise<T>,
  shouldCache: (value: T) => boolean = () => true,
): Promise<T> {
  const model = process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";
  return withScopedAIResultCache(userScope, operation, input, model, run, shouldCache);
}
