import { createHash } from "node:crypto";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const CACHE_TTL_MS = 15 * 60 * 1_000;
const MAX_CACHE_ENTRIES = 100;
const cache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();

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
  // Without an authenticated or browser-scoped identity, never share cached content.
  if (!userScope) return run();

  const key = createHash("sha256")
    .update(JSON.stringify({ version: 1, operation, userScope, model: process.env.OPENROUTER_MODEL?.trim() || "openrouter/free", input }))
    .digest("hex");
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.value as T;
  if (cached) cache.delete(key);

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const request = run().then((value) => {
    if (shouldCache(value)) {
      cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
      if (cache.size > MAX_CACHE_ENTRIES) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
      }
    }
    return value;
  }).finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}
