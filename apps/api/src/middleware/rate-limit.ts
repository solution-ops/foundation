import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types";
import type { ApiErrorResponse } from "../utils/error-handler";

/** Period (in seconds) configured on the rate limit bindings. */
const RETRY_AFTER_SECONDS = "60";

/** Builds a 429 JSON response with a Retry-After header. */
function tooManyRequests(): Response {
  const body: ApiErrorResponse = {
    status: 429,
    message: "Too many requests",
    type: "RATE_LIMIT_ERROR",
    timestamp: new Date().toISOString(),
  };
  return new Response(JSON.stringify(body), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": RETRY_AFTER_SECONDS,
    },
  });
}

/**
 * Rate-limiting middleware for authenticated API routes.
 *
 * Keys on the authenticated user's ID so each user gets their own
 * quota. If the binding is not present (local dev / tests) the
 * middleware is a no-op.
 */
export const rateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const limiter = c.env.RATE_LIMITER;
  if (!limiter) return next();

  const userId = c.get("user")?.id;
  if (!userId) return next();

  const { success } = await limiter.limit({ key: userId });
  if (!success) return tooManyRequests();

  await next();
});

/**
 * Rate-limiting middleware for auth routes (login / signup).
 *
 * Keys on the client IP because no session exists yet.
 * Uses a stricter limit (AUTH_RATE_LIMITER) to prevent
 * brute-force and credential-stuffing attacks.
 */
export const authRateLimit = createMiddleware<AppEnv>(async (c, next) => {
  const limiter = c.env.AUTH_RATE_LIMITER;
  if (!limiter) return next();

  const ip = c.req.header("cf-connecting-ip");
  // Skip rate limiting in local dev — Cloudflare always sets
  // cf-connecting-ip in production. Without it, all local requests
  // would share one bucket and hit the limit immediately.
  if (!ip) return next();

  const { success } = await limiter.limit({ key: ip });
  if (!success) return tooManyRequests();

  await next();
});
