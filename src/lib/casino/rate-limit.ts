const buckets = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return;
  }
  if (b.n >= limit) {
    const err = Object.assign(new Error("Too many requests. Wait a moment."), {
      status: 429,
    });
    throw err;
  }
  b.n += 1;
}
