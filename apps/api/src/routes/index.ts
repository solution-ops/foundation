import { Hono } from "hono";
import type { AppEnv } from "../types";
import { requireAuth } from "../utils/require-auth";

const protectedIndex = new Hono<AppEnv>();

/**
 * Protected root route — requires a valid session.
 */
protectedIndex.get("/", requireAuth, (c) => {
  return c.json({ message: "Secret data" }, 200);
});

export { protectedIndex };
