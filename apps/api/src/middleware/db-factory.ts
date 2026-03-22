import { drizzle } from "drizzle-orm/node-postgres";
import { createMiddleware } from "hono/factory";
import { Client } from "pg";
import type { AppEnv } from "../types";

/**
 * Database factory middleware — creates a Drizzle instance per request.
 *
 * With Hyperdrive (production): fresh pg.Client per request, as required
 * by the Cloudflare Workers runtime — connections cannot be reused across
 * request contexts. The client is closed after the request completes.
 *
 * Without Hyperdrive (tests, local dev): cached singleton with a lazy Pool
 * that only connects on first actual query.
 *
 * Sets `c.var.db` for use by downstream middleware and route handlers.
 *
 * @see https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/
 */

let cachedDb: AppEnv["Variables"]["db"] | null = null;

export const dbFactory = createMiddleware<AppEnv>(async (c, next) => {
  if (c.env.HYPERDRIVE) {
    const client = new Client({
      connectionString: c.env.HYPERDRIVE.connectionString,
    });
    await client.connect();
    try {
      c.set("db", drizzle(client));
      await next();
    } finally {
      await client.end();
    }
    return;
  }

  // No Hyperdrive (tests, local dev): cached singleton with lazy Pool
  if (!cachedDb) {
    cachedDb = drizzle(c.env.DATABASE_URL);
  }
  c.set("db", cachedDb);
  await next();
});
