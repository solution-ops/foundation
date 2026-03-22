import { Hono } from "hono";
import type { AppEnv } from "../types";

const auth = new Hono<AppEnv>();

/**
 * Catch-all route for Better Auth.
 *
 * `c.req.raw` is already a Web Standard Request — no conversion needed.
 */
auth.all("/*", async (c) => {
  const authInstance = c.get("auth");
  return authInstance.handler(c.req.raw);
});

export { auth };
