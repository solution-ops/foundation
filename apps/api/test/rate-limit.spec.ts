import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { describe, expect, it, vi } from "vitest";
import { authRateLimit, rateLimit } from "../src/middleware/rate-limit";
import type { AppEnv } from "../src/types";

/**
 * Creates a mock rate limiter binding that returns the given `success` value.
 */
function mockLimiter(success: boolean) {
  return { limit: vi.fn().mockResolvedValue({ success }) };
}

/**
 * Middleware that injects a fake authenticated user into context.
 */
const fakeUser = createMiddleware<AppEnv>(async (c, next) => {
  c.set("user", { id: "user-1" } as AppEnv["Variables"]["user"]);
  await next();
});

// ── General rate limiter ──────────────────────────────────────────────

describe("rateLimit middleware", () => {
  it("allows requests when the limiter returns success", async () => {
    const limiter = mockLimiter(true);
    const app = new Hono<AppEnv>();
    app.use("*", fakeUser);
    app.use("*", rateLimit);
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", {}, { RATE_LIMITER: limiter } as unknown as AppEnv["Bindings"]);
    expect(res.status).toBe(200);
    expect(limiter.limit).toHaveBeenCalledWith({ key: "user-1" });
  });

  it("returns 429 with Retry-After when the limiter rejects", async () => {
    const limiter = mockLimiter(false);
    const app = new Hono<AppEnv>();
    app.use("*", fakeUser);
    app.use("*", rateLimit);
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", {}, { RATE_LIMITER: limiter } as unknown as AppEnv["Bindings"]);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");

    const body = await res.json();
    expect(body).toMatchObject({ status: 429, type: "RATE_LIMIT_ERROR" });
  });

  it("skips rate limiting when binding is not present (local dev)", async () => {
    const app = new Hono<AppEnv>();
    app.use("*", fakeUser);
    app.use("*", rateLimit);
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", {}, {} as AppEnv["Bindings"]);
    expect(res.status).toBe(200);
  });

  it("skips rate limiting when no user is set", async () => {
    const limiter = mockLimiter(true);
    const app = new Hono<AppEnv>();
    app.use("*", rateLimit);
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", {}, { RATE_LIMITER: limiter } as unknown as AppEnv["Bindings"]);
    expect(res.status).toBe(200);
    expect(limiter.limit).not.toHaveBeenCalled();
  });
});

// ── Auth rate limiter ─────────────────────────────────────────────────

describe("authRateLimit middleware", () => {
  it("allows requests when the limiter returns success", async () => {
    const limiter = mockLimiter(true);
    const app = new Hono<AppEnv>();
    app.use("*", authRateLimit);
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", { headers: { "cf-connecting-ip": "1.2.3.4" } }, {
      AUTH_RATE_LIMITER: limiter,
    } as unknown as AppEnv["Bindings"]);
    expect(res.status).toBe(200);
    expect(limiter.limit).toHaveBeenCalledWith({ key: "1.2.3.4" });
  });

  it("returns 429 with Retry-After when the limiter rejects", async () => {
    const limiter = mockLimiter(false);
    const app = new Hono<AppEnv>();
    app.use("*", authRateLimit);
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", { headers: { "cf-connecting-ip": "1.2.3.4" } }, {
      AUTH_RATE_LIMITER: limiter,
    } as unknown as AppEnv["Bindings"]);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");

    const body = await res.json();
    expect(body).toMatchObject({ status: 429, type: "RATE_LIMIT_ERROR" });
  });

  it("skips rate limiting when cf-connecting-ip is missing (local dev)", async () => {
    const limiter = mockLimiter(true);
    const app = new Hono<AppEnv>();
    app.use("*", authRateLimit);
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", {}, { AUTH_RATE_LIMITER: limiter } as unknown as AppEnv["Bindings"]);
    expect(res.status).toBe(200);
    expect(limiter.limit).not.toHaveBeenCalled();
  });

  it("skips rate limiting when binding is not present (local dev)", async () => {
    const app = new Hono<AppEnv>();
    app.use("*", authRateLimit);
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test", {}, {} as AppEnv["Bindings"]);
    expect(res.status).toBe(200);
  });
});
