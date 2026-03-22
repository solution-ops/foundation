import { createId } from "@paralleldrive/cuid2";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types";

/**
 * Request logging middleware.
 *
 * Logs method, path, client IP, user-agent, and a request ID for
 * every incoming request.
 */
export const requestLogger = createMiddleware<AppEnv>(async (c, next) => {
  const timestamp = new Date().toISOString();
  const method = c.req.method;
  const url = c.req.path;
  const clientIP = c.req.header("cf-connecting-ip");
  const userAgent = c.req.header("user-agent") || "unknown";
  const requestId = c.req.header("x-request-id") || createId();

  const logData = {
    timestamp,
    method,
    url,
    clientIP,
    userAgent,
    requestId,
  };

  console.info(`${method} ${url} -`, JSON.stringify(logData));

  await next();
});
