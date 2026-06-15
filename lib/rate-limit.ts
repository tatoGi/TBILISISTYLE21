import { NextRequest, NextResponse } from "next/server";

type SlidingWindow = { timestamps: number[] };

const buckets = new Map<string, SlidingWindow>();

// Purge stale entries every 5 minutes to prevent unbounded growth.
const PURGE_INTERVAL_MS = 5 * 60 * 1000;
let lastPurge = Date.now();

function purgeStale(now: number, windowMs: number) {
  if (now - lastPurge < PURGE_INTERVAL_MS) return;
  lastPurge = now;
  for (const [key, window] of buckets) {
    window.timestamps = window.timestamps.filter((t) => now - t < windowMs);
    if (window.timestamps.length === 0) buckets.delete(key);
  }
}

type RateLimitConfig = {
  /** Unique namespace so different routes don't share counters. */
  key: string;
  /** Maximum requests allowed within the window. */
  limit: number;
  /** Window size in seconds. */
  windowSeconds: number;
};

/**
 * Returns a 429 response if the caller exceeds the rate limit, or null if
 * the request is allowed through.
 *
 * Keyed on the client IP + the config namespace.
 */
export function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const bucketKey = `${config.key}:${ip}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  purgeStale(now, windowMs);

  let window = buckets.get(bucketKey);
  if (!window) {
    window = { timestamps: [] };
    buckets.set(bucketKey, window);
  }

  // Drop timestamps outside the current window.
  window.timestamps = window.timestamps.filter((t) => now - t < windowMs);

  if (window.timestamps.length >= config.limit) {
    const retryAfter = Math.ceil(
      (window.timestamps[0] + windowMs - now) / 1000
    );
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  window.timestamps.push(now);
  return null;
}
