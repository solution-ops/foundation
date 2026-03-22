import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types";
import { createAuth } from "../utils/auth";

/**
 * Auth factory middleware — creates a Better Auth instance per request.
 *
 * Reads the per-request Drizzle `db` from `c.var.db` (set by db-factory)
 * and passes it to createAuth. Sets `c.var.auth` for downstream handlers.
 */
export const authFactory = createMiddleware<AppEnv>(async (c, next) => {
  const auth = createAuth(c.env, c.var.db);
  c.set("auth", auth as AppEnv["Variables"]["auth"]);
  await next();
});
