import { itemAuditLogs } from "@foundation/db/schemas/item-audit-logs";
import { users } from "@foundation/db/schemas/users";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { beforeEach, describe, expect, it } from "vitest";
import { createAuditEntry, listItemActivity } from "../../src/services/item-audit-logs";
import { createTestDb, OTHER_USER_ID, TEST_USER } from "../helpers";

const USER_ID = TEST_USER.id;

let db: NodePgDatabase;

beforeEach(async () => {
  db = await createTestDb();

  // Seed test users to satisfy FK constraints
  await db.insert(users).values([
    {
      id: USER_ID,
      name: "Test User",
      email: "test@example.com",
    },
    {
      id: OTHER_USER_ID,
      name: "Other User",
      email: "other@example.com",
    },
  ]);
});

// --- Helper to seed an audit entry directly ---

async function seedAuditEntry(overrides: Partial<typeof itemAuditLogs.$inferInsert> = {}) {
  const now = new Date();
  const [entry] = await db
    .insert(itemAuditLogs)
    .values({
      itemId: "item-1",
      userId: USER_ID,
      action: "create",
      timestamp: now,
      ...overrides,
    })
    .returning();
  return entry;
}

// ===================== createAuditEntry =====================

describe("createAuditEntry", () => {
  it("creates an audit entry with all fields", async () => {
    const beforeState = null;
    const afterState = {
      id: "item-1",
      userId: USER_ID,
      title: "Test item",
      description: null,
      status: "todo" as const,
      priority: "none" as const,
      dateDue: null,
      dateCreated: new Date("2025-06-01"),
      dateUpdated: new Date("2025-06-01"),
      dateDeleted: null,
      categoryId: null,
    };

    const entry = await createAuditEntry(db, {
      itemId: "item-1",
      userId: USER_ID,
      action: "create",
      beforeState,
      afterState,
    });

    expect(entry.id).toBeDefined();
    expect(entry.itemId).toBe("item-1");
    expect(entry.userId).toBe(USER_ID);
    expect(entry.action).toBe("create");
    expect(entry.beforeState).toBeNull();
    expect(entry.afterState).toMatchObject({ title: "Test item" });
    expect(entry.timestamp).toBeDefined();
  });

  it("stores before and after state for updates", async () => {
    const entry = await createAuditEntry(db, {
      itemId: "item-1",
      userId: USER_ID,
      action: "update",
      beforeState: {
        id: "item-1",
        userId: USER_ID,
        title: "Original",
        description: null,
        status: "todo" as const,
        priority: "none" as const,
        dateDue: null,
        dateCreated: new Date("2025-06-01"),
        dateUpdated: new Date("2025-06-01"),
        dateDeleted: null,
        categoryId: null,
      },
      afterState: {
        id: "item-1",
        userId: USER_ID,
        title: "Updated",
        description: null,
        status: "todo" as const,
        priority: "none" as const,
        dateDue: null,
        dateCreated: new Date("2025-06-01"),
        dateUpdated: new Date("2025-06-02"),
        dateDeleted: null,
        categoryId: null,
      },
    });

    expect(entry.action).toBe("update");
    expect(entry.beforeState).toMatchObject({ title: "Original" });
    expect(entry.afterState).toMatchObject({ title: "Updated" });
  });
});

// ===================== listItemActivity =====================

describe("listItemActivity", () => {
  it("returns empty result when no activity exists", async () => {
    const result = await listItemActivity(db, "nonexistent-item", {
      limit: 20,
    });

    expect(result.activity).toEqual([]);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeUndefined();
  });

  it("returns activity entries in reverse chronological order", async () => {
    await seedAuditEntry({
      itemId: "item-1",
      action: "create",
      timestamp: new Date("2025-01-01"),
    });
    await seedAuditEntry({
      itemId: "item-1",
      action: "update",
      timestamp: new Date("2025-06-01"),
    });

    const result = await listItemActivity(db, "item-1", { limit: 20 });

    expect(result.activity).toHaveLength(2);
    expect(result.activity[0].action).toBe("update");
    expect(result.activity[1].action).toBe("create");
  });

  it("only returns entries for the specified itemId", async () => {
    await seedAuditEntry({ itemId: "item-1" });
    await seedAuditEntry({ itemId: "item-2" });

    const result = await listItemActivity(db, "item-1", { limit: 20 });

    expect(result.activity).toHaveLength(1);
    expect(result.activity[0].itemId).toBe("item-1");
  });

  it("returns hasMore and nextCursor when more items exist", async () => {
    await seedAuditEntry({
      itemId: "item-1",
      timestamp: new Date("2025-03-01"),
    });
    await seedAuditEntry({
      itemId: "item-1",
      timestamp: new Date("2025-02-01"),
    });
    await seedAuditEntry({
      itemId: "item-1",
      timestamp: new Date("2025-01-01"),
    });

    const result = await listItemActivity(db, "item-1", { limit: 2 });

    expect(result.activity).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBeDefined();
  });

  it("throws on invalid cursor", async () => {
    await expect(listItemActivity(db, "item-1", { limit: 20, cursor: "not-valid-base64!" })).rejects.toThrow(
      "Invalid cursor",
    );
  });

  it("returns second page via cursor", async () => {
    await seedAuditEntry({
      itemId: "item-1",
      timestamp: new Date("2025-03-01"),
    });
    await seedAuditEntry({
      itemId: "item-1",
      timestamp: new Date("2025-02-01"),
    });
    await seedAuditEntry({
      itemId: "item-1",
      timestamp: new Date("2025-01-01"),
    });

    const page1 = await listItemActivity(db, "item-1", { limit: 2 });
    const page2 = await listItemActivity(db, "item-1", {
      limit: 2,
      cursor: page1.nextCursor,
    });

    expect(page2.activity).toHaveLength(1);
    expect(page2.hasMore).toBe(false);
    expect(page2.nextCursor).toBeUndefined();
  });
});
