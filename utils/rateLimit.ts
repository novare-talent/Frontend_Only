import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // Logged once at module load. Rate limiting is disabled (fail-open) without Redis.
    console.warn(
      "[rateLimit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set - rate limiting is DISABLED."
    );
    return null;
  }
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
  globalIp:         makeLimiter(120, "1 m"),  // 120 req/min per IP (applied by middleware, where wired)
  authIp:           makeLimiter(20, "15 m"),  // 20 req/15 min per IP - sign-in/sign-up/auth
  generateForm:     makeLimiter(3, "1 m"),    // 3 req/min per user
  evaluateProxy:    makeLimiter(2, "5 m"),    // 2 req/5 min per user (external evaluate proxy)
  evaluateGemini:   makeLimiter(5, "1 m"),    // 5 req/min per user - /api/evaluate
  consumeCredit:    makeLimiter(10, "1 m"),   // 10 req/min per user
  submissionUpload: makeLimiter(5, "1 m"),    // 5 req/min per IP
  uploadResume:     makeLimiter(10, "10 m"),  // 10 uploads/10 min per IP - /api/upload-resume
  applyReferral:    makeLimiter(5, "10 m"),   // 5 req/10 min per user
  sendEmail:        makeLimiter(5, "10 m"),   // 5 req/10 min per user - report/rejection emails
  profilesLookup:   makeLimiter(30, "1 m"),   // 30 req/min per user
  resetPassword:    makeLimiter(5, "15 m"),   // 5 req/15 min per email and per IP
} as const;

// Upstash sits in the request path of every rate-limited route. A slow or
// unreachable Redis must never hold the request open until the platform's
// gateway gives up with a 504 — past this budget we stop waiting and allow the
// request through.
const LIMIT_TIMEOUT_MS = 1500;

export async function applyRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<NextResponse | null> {
  if (!limiter) return null;

  let result: { success: boolean; reset: number } | null = null;
  try {
    result = await Promise.race([
      limiter.limit(identifier),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), LIMIT_TIMEOUT_MS)),
    ]);
  } catch (error) {
    // Redis unreachable / quota exhausted — fail open rather than lock everyone out.
    console.error("[rateLimit] limiter error, failing open:", error);
    return null;
  }

  // Timed out — fail open.
  if (!result) {
    console.warn(`[rateLimit] timed out after ${LIMIT_TIMEOUT_MS}ms, failing open: ${identifier}`);
    return null;
  }

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many requests", retryAfter },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  return null;
}
