import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

function makeLimiter(
  requests: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`
): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) });
}

export const limiters = {
  globalIp:         makeLimiter(120, "1 m"),  // 120 req/min per IP — all /api/*
  authIp:           makeLimiter(5, "15 m"),   // 5 req/15 min per IP — sign-in/sign-up/auth
  generateForm:     makeLimiter(3, "1 m"),    // 3 req/min per user
  evaluateProxy:    makeLimiter(2, "5 m"),    // 2 req/5 min per user
  consumeCredit:    makeLimiter(10, "1 m"),   // 10 req/min per user
  submissionUpload: makeLimiter(5, "1 m"),    // 5 req/min per IP
} as const;

/**
 * Check a rate limit and return a 429 NextResponse if exceeded, or null if allowed.
 * Gracefully returns null when Upstash is not configured (no env vars).
 */
export async function applyRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null;
  const { success, reset } = await limiter.limit(identifier);
  if (!success) {
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many requests", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  return null;
}
