import { PGlite } from "@electric-sql/pglite";
import { categories } from "@foundation/db/schemas/categories";
import { itemAuditActionEnum, itemAuditLogs } from "@foundation/db/schemas/item-audit-logs";
import { itemPriorityEnum, itemStatusEnum, items } from "@foundation/db/schemas/items";
import { users } from "@foundation/db/schemas/users";
import { pushSchema } from "drizzle-kit/api";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle } from "drizzle-orm/pglite";
import type { Bindings, Variables } from "../src/types";

/**
 * Mock environment bindings for tests.
 *
 * Uses placeholder values — auth/DB-dependent tests require
 * real credentials or mocked implementations.
 */
export const MOCK_ENV: Bindings = {
  DATABASE_URL: "postgresql://test:test@localhost:5432/test",
  AUTH_SECRET: "test-auth-secret-at-least-32-characters-long",
  GOOGLE_CLIENT_ID: "test-google-client-id",
  GOOGLE_CLIENT_SECRET: "test-google-client-secret",
  ALLOWED_ORIGINS: "http://localhost:8080",
  NODE_ENV: "test",
};

// --- Test user/session constants ---

export const TEST_USER: Variables["user"] = {
  id: "test-user-1",
  name: "Test User",
  email: "test@example.com",
  emailVerified: true,
  image: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const OTHER_USER_ID = "other-user-99";

// --- PGLite test database ---

/**
 * Creates an in-memory PGLite database with schema synced from
 * Drizzle schema definitions via `pushSchema`.
 *
 * Schema changes are picked up automatically — no raw SQL to maintain.
 */
export async function createTestDb(): Promise<NodePgDatabase> {
  const pglite = new PGlite();
  const db = drizzle(pglite);

  // pushSchema reads the Drizzle schema and generates + applies DDL
  // Spread all schemas so pushSchema resolves FK dependencies (tasks → users)
  const { apply } = await pushSchema(
    { itemStatusEnum, itemPriorityEnum, itemAuditActionEnum, users, categories, items, itemAuditLogs },
    db,
  );
  await apply();

  return db as unknown as NodePgDatabase;
}
