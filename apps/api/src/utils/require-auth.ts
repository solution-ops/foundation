import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../types";

/**
 * Middleware that requires a valid session.
 *
 * Reads the auth instance from `c.var.auth` (set by auth-factory),
 * validates the session, and sets `c.var.session` / `c.var.user`.
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  // Skip validation if session was already resolved upstream
  if (c.get("session") && c.get("user")) {
    return next();
  }

  const auth = c.get("auth");

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  c.set("session", session.session);
  c.set("user", session.user);

  await next();
});
