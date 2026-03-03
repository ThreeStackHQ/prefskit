const store = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function getRateLimitHeaders(key: string, limit: number): Record<string, string> {
  const entry = store.get(key);
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": entry
      ? String(Math.max(0, limit - entry.count))
      : String(limit),
    "X-RateLimit-Reset": entry
      ? String(Math.ceil(entry.reset / 1000))
      : String(Math.ceil((Date.now() + 60000) / 1000)),
  };
}
