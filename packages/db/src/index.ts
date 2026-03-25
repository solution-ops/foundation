import { dbEnv } from "@foundation/env/db";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

/**
 * Database connection factory for Cloudflare Workers
 * - Uses HTTP-based Neon connection to avoid WebSocket I/O context issues
 * - Each call creates a fresh HTTP-based connection
 * - Optimized for serverless environments like Cloudflare Workers
 */
export function createDb() {
  // Use HTTP-based Neon connection instead of WebSocket
  // This avoids I/O context violations in Cloudflare Workers
  const sql = neon(dbEnv.DATABASE_URL);
  return drizzle(sql);
}

export type DB = ReturnType<typeof createDb>;

// Export a default instance
export const db = createDb();
