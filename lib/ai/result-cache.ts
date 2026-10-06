import { createHash } from "node:crypto";

const CACHE_TTL_MS = 15 * 60 * 1_000;
const MAX_CACHE_ENTRIES = 100;
const cache = new Map<string, { expiresAt: number; value: unknown }>();
const inFlight = new Map<string, Promise<unknown>>();

export async function withScopedAIResultCache<T>(
  userScope: string | null,
  operation: string,
  input: unknown,
  model: string,
  run: () => Promise<T>,
  shouldCache: (value: T) => boolean = () => true,
): Promise<T> {
  if (!userScope) return run();

  const key = createHash("sha256")
    .update(JSON.stringify({ version: 1, operation, userScope, model, input }))
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
