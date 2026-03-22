import { categories } from "@foundation/db/schemas/categories";
import { itemAuditLogs } from "@foundation/db/schemas/item-audit-logs";
import { items } from "@foundation/db/schemas/items";
import { users } from "@foundation/db/schemas/users";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createItem,
  deleteItem,
  getItem,
  listItems,
  purgeExpiredItems,
  restoreItem,
  updateItem,
} from "../../src/services/items";
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

// --- Helper to seed a category directly ---

async function seedCategory(overrides: Partial<typeof categories.$inferInsert> = {}) {
  const [category] = await db
    .insert(categories)
    .values({
      userId: USER_ID,
      name: "Test Category",
      color: "blue",
      order: 0,
      dateCreated: new Date(),
      dateUpdated: new Date(),
      ...overrides,
    })
    .returning();
  return category;
}

// --- Helper to seed an item directly via Drizzle ---

async function seedItem(overrides: Partial<typeof items.$inferInsert> = {}) {
  const now = new Date();
  const [item] = await db
    .insert(items)
    .values({
      userId: USER_ID,
      title: "Seeded item",
      dateCreated: now,
      dateUpdated: now,
      ...overrides,
    })
    .returning();
  return item;
}

// ===================== createItem =====================

describe("createItem", () => {
  it("creates an item with all fields and returns it", async () => {
    const input = {
      title: "My item",
      description: "A description",
      status: "in_progress" as const,
      priority: "high" as const,
      dateDue: new Date("2025-12-01"),
    };

    const item = await createItem(db, USER_ID, input);

    expect(item.title).toBe("My item");
    expect(item.description).toBe("A description");
    expect(item.status).toBe("in_progress");
    expect(item.priority).toBe("high");
    expect(item.dateDue).toEqual(new Date("2025-12-01"));
    expect(item.userId).toBe(USER_ID);
    expect(item.id).toBeDefined();
  });

  it("applies defaults for status and priority when omitted", async () => {
    const item = await createItem(db, USER_ID, { title: "Minimal item" });

    expect(item.status).toBe("todo");
    expect(item.priority).toBe("none");
    expect(item.description).toBeNull();
    expect(item.dateDue).toBeNull();
  });

  it("sets userId from parameter, not from input", async () => {
    // Use OTHER_USER_ID (already seeded) to prove userId comes from param
    const item = await createItem(db, OTHER_USER_ID, {
      title: "Test",
    });

    expect(item.userId).toBe(OTHER_USER_ID);
  });

  it("creates an item with categoryId", async () => {
    const category = await seedCategory({ name: "Work" });

    const item = await createItem(db, USER_ID, {
      title: "Categorized item",
      categoryId: category.id,
    });

    expect(item.categoryId).toBe(category.id);
  });

  it("creates an item with null categoryId by default", async () => {
    const item = await createItem(db, USER_ID, { title: "No category" });

    expect(item.categoryId).toBeNull();
  });

  it("rejects categoryId belonging to another user", async () => {
    const otherCategory = await seedCategory({ name: "Other Work", userId: OTHER_USER_ID });

    await expect(createItem(db, USER_ID, { title: "Bad category", categoryId: otherCategory.id })).rejects.toThrow(
      "Category not found",
    );
  });

  it("rejects nonexistent categoryId", async () => {
    await expect(createItem(db, USER_ID, { title: "Bad category", categoryId: "nonexistent-id" })).rejects.toThrow(
      "Category not found",
    );
  });

  it("creates an audit entry with action 'create'", async () => {
    const item = await createItem(db, USER_ID, { title: "Audited item" });

    const entries = await db.select().from(itemAuditLogs).where(eq(itemAuditLogs.itemId, item.id));

    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe("create");
    expect(entries[0].userId).toBe(USER_ID);
    expect(entries[0].beforeState).toBeNull();
    expect(entries[0].afterState).toMatchObject({ title: "Audited item" });
  });
});

// ===================== listItems =====================

describe("listItems", () => {
  it("returns only the given user's items", async () => {
    await seedItem({ title: "My item" });
    await seedItem({ title: "Other user item", userId: OTHER_USER_ID });

    const result = await listItems(db, USER_ID, { limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("My item");
  });

  it("filters by status", async () => {
    await seedItem({ title: "Todo item", status: "todo" });
    await seedItem({ title: "Done item", status: "done" });

    const result = await listItems(db, USER_ID, {
      limit: 20,
      status: "done",
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Done item");
  });

  it("filters by priority", async () => {
    await seedItem({ title: "No priority", priority: "none" });
    await seedItem({ title: "Urgent item", priority: "urgent" });

    const result = await listItems(db, USER_ID, {
      limit: 20,
      priority: "urgent",
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Urgent item");
  });

  it("orders by dateCreated DESC", async () => {
    await seedItem({
      title: "Old",
      dateCreated: new Date("2025-01-01"),
    });
    await seedItem({
      title: "New",
      dateCreated: new Date("2025-06-01"),
    });

    const result = await listItems(db, USER_ID, { limit: 20 });

    expect(result.items[0].title).toBe("New");
    expect(result.items[1].title).toBe("Old");
  });

  it("returns hasMore and nextCursor when more items exist", async () => {
    await seedItem({
      title: "Item 1",
      dateCreated: new Date("2025-03-01"),
    });
    await seedItem({
      title: "Item 2",
      dateCreated: new Date("2025-02-01"),
    });
    await seedItem({
      title: "Item 3",
      dateCreated: new Date("2025-01-01"),
    });

    const result = await listItems(db, USER_ID, { limit: 2 });

    expect(result.items).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toBeDefined();
  });

  it("returns second page via cursor", async () => {
    await seedItem({
      title: "Item 1",
      dateCreated: new Date("2025-03-01"),
    });
    await seedItem({
      title: "Item 2",
      dateCreated: new Date("2025-02-01"),
    });
    await seedItem({
      title: "Item 3",
      dateCreated: new Date("2025-01-01"),
    });

    const page1 = await listItems(db, USER_ID, { limit: 2 });
    const page2 = await listItems(db, USER_ID, {
      limit: 2,
      cursor: page1.nextCursor,
    });

    expect(page2.items).toHaveLength(1);
    expect(page2.items[0].title).toBe("Item 3");
    expect(page2.hasMore).toBe(false);
    expect(page2.nextCursor).toBeUndefined();
  });

  it("returns empty result when no items exist", async () => {
    const result = await listItems(db, USER_ID, { limit: 20 });

    expect(result.items).toEqual([]);
    expect(result.hasMore).toBe(false);
    expect(result.nextCursor).toBeUndefined();
  });

  it("excludes soft-deleted items by default", async () => {
    await seedItem({ title: "Active item" });
    await seedItem({ title: "Deleted item", dateDeleted: new Date() });

    const result = await listItems(db, USER_ID, { limit: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Active item");
  });

  it("filters by category", async () => {
    const category = await seedCategory({ name: "Work" });
    await seedItem({ title: "Work item", categoryId: category.id });
    await seedItem({ title: "Uncategorized item" });

    const result = await listItems(db, USER_ID, {
      limit: 20,
      category: category.id,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Work item");
  });

  it("returns only soft-deleted items when deleted=true", async () => {
    await seedItem({ title: "Active item" });
    await seedItem({ title: "Deleted item", dateDeleted: new Date() });

    const result = await listItems(db, USER_ID, { limit: 20, deleted: true });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe("Deleted item");
  });
});

// ===================== getItem =====================

describe("getItem", () => {
  it("returns the item when found", async () => {
    const seeded = await seedItem({ title: "Find me" });

    const item = await getItem(db, USER_ID, seeded.id);

    expect(item).not.toBeNull();
    expect(item?.title).toBe("Find me");
  });

  it("returns null for non-existent ID", async () => {
    const item = await getItem(db, USER_ID, "nonexistent-id");

    expect(item).toBeNull();
  });

  it("returns null for another user's item", async () => {
    const seeded = await seedItem({ userId: OTHER_USER_ID });

    const item = await getItem(db, USER_ID, seeded.id);

    expect(item).toBeNull();
  });

  it("returns null for soft-deleted item", async () => {
    const seeded = await seedItem({ dateDeleted: new Date() });

    const item = await getItem(db, USER_ID, seeded.id);

    expect(item).toBeNull();
  });
});

// ===================== updateItem =====================

describe("updateItem", () => {
  it("updates title and returns the updated item", async () => {
    const seeded = await seedItem({ title: "Original" });

    const item = await updateItem(db, USER_ID, seeded.id, {
      title: "Updated",
    });

    expect(item).not.toBeNull();
    expect(item?.title).toBe("Updated");
  });

  it("preserves untouched fields on partial update", async () => {
    const seeded = await seedItem({
      title: "Keep me",
      description: "Also keep",
      status: "in_progress",
      priority: "high",
    });

    const item = await updateItem(db, USER_ID, seeded.id, {
      status: "done",
    });

    expect(item?.title).toBe("Keep me");
    expect(item?.description).toBe("Also keep");
    expect(item?.priority).toBe("high");
    expect(item?.status).toBe("done");
  });

  it("sets dateUpdated to current time", async () => {
    const seeded = await seedItem({
      dateUpdated: new Date("2025-01-01"),
    });
    const before = new Date();

    const item = await updateItem(db, USER_ID, seeded.id, {
      title: "Bump",
    });

    expect(item?.dateUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("can null out optional fields", async () => {
    const seeded = await seedItem({
      description: "Will be removed",
      dateDue: new Date("2025-12-01"),
    });

    const item = await updateItem(db, USER_ID, seeded.id, {
      description: null,
      dateDue: null,
    });

    expect(item?.description).toBeNull();
    expect(item?.dateDue).toBeNull();
  });

  it("returns null for non-existent or other user's item", async () => {
    const seeded = await seedItem({ userId: OTHER_USER_ID });

    const result1 = await updateItem(db, USER_ID, "nonexistent", {
      title: "X",
    });
    const result2 = await updateItem(db, USER_ID, seeded.id, {
      title: "X",
    });

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it("creates an audit entry with before and after state", async () => {
    const seeded = await seedItem({ title: "Before" });

    await updateItem(db, USER_ID, seeded.id, { title: "After" });

    const entries = await db.select().from(itemAuditLogs).where(eq(itemAuditLogs.itemId, seeded.id));

    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe("update");
    expect(entries[0].beforeState).toMatchObject({ title: "Before" });
    expect(entries[0].afterState).toMatchObject({ title: "After" });
  });

  it("does not create an audit entry for non-existent item", async () => {
    await updateItem(db, USER_ID, "nonexistent", { title: "X" });

    const entries = await db.select().from(itemAuditLogs).where(eq(itemAuditLogs.itemId, "nonexistent"));

    expect(entries).toHaveLength(0);
  });

  it("sets categoryId on an item", async () => {
    const category = await seedCategory({ name: "Work" });
    const seeded = await seedItem();

    const updated = await updateItem(db, USER_ID, seeded.id, {
      categoryId: category.id,
    });

    expect(updated?.categoryId).toBe(category.id);
  });

  it("clears categoryId when set to null", async () => {
    const category = await seedCategory({ name: "Work" });
    const seeded = await seedItem({ categoryId: category.id });

    const updated = await updateItem(db, USER_ID, seeded.id, {
      categoryId: null,
    });

    expect(updated?.categoryId).toBeNull();
  });

  it("rejects categoryId belonging to another user", async () => {
    const seeded = await seedItem();
    const otherCategory = await seedCategory({ name: "Other Work", userId: OTHER_USER_ID });

    await expect(updateItem(db, USER_ID, seeded.id, { categoryId: otherCategory.id })).rejects.toThrow(
      "Category not found",
    );
  });

  it("returns null for soft-deleted item", async () => {
    const seeded = await seedItem({ dateDeleted: new Date() });

    const result = await updateItem(db, USER_ID, seeded.id, { title: "X" });

    expect(result).toBeNull();
  });
});

// ===================== deleteItem =====================

describe("deleteItem", () => {
  it("sets dateDeleted (soft-delete) and hides from getItem", async () => {
    const seeded = await seedItem();

    const result = await deleteItem(db, USER_ID, seeded.id);
    const after = await getItem(db, USER_ID, seeded.id);

    expect(result).toBe(true);
    expect(after).toBeNull();

    // Row still exists in DB with dateDeleted set
    const [row] = await db.select().from(items).where(eq(items.id, seeded.id));
    expect(row).toBeDefined();
    expect(row.dateDeleted).not.toBeNull();
  });

  it("hides soft-deleted item from listItems", async () => {
    const seeded = await seedItem({ title: "Will be deleted" });
    await deleteItem(db, USER_ID, seeded.id);

    const result = await listItems(db, USER_ID, { limit: 20 });

    expect(result.items.find((t) => t.id === seeded.id)).toBeUndefined();
  });

  it("returns false for non-existent item", async () => {
    const result = await deleteItem(db, USER_ID, "nonexistent");

    expect(result).toBe(false);
  });

  it("returns false for another user's item", async () => {
    const seeded = await seedItem({ userId: OTHER_USER_ID });

    const result = await deleteItem(db, USER_ID, seeded.id);

    expect(result).toBe(false);
  });

  it("returns false for already-deleted item", async () => {
    const seeded = await seedItem({ dateDeleted: new Date() });

    const result = await deleteItem(db, USER_ID, seeded.id);

    expect(result).toBe(false);
  });

  it("creates audit entry with afterState containing dateDeleted", async () => {
    const seeded = await seedItem({ title: "Deleted item" });

    await deleteItem(db, USER_ID, seeded.id);

    const entries = await db.select().from(itemAuditLogs).where(eq(itemAuditLogs.itemId, seeded.id));

    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe("delete");
    expect(entries[0].beforeState).toMatchObject({ title: "Deleted item" });
    expect((entries[0].afterState as Record<string, unknown>).dateDeleted).toBeDefined();
  });

  it("does not create an audit entry for non-existent item", async () => {
    await deleteItem(db, USER_ID, "nonexistent");

    const entries = await db.select().from(itemAuditLogs).where(eq(itemAuditLogs.itemId, "nonexistent"));

    expect(entries).toHaveLength(0);
  });
});

// ===================== restoreItem =====================

describe("restoreItem", () => {
  it("restores a soft-deleted item", async () => {
    const seeded = await seedItem({ dateDeleted: new Date() });

    const restored = await restoreItem(db, USER_ID, seeded.id);

    expect(restored).not.toBeNull();
    expect(restored?.dateDeleted).toBeNull();
  });

  it("restored item is visible in getItem and listItems", async () => {
    const seeded = await seedItem({ title: "Restore me", dateDeleted: new Date() });

    await restoreItem(db, USER_ID, seeded.id);

    const item = await getItem(db, USER_ID, seeded.id);
    expect(item).not.toBeNull();
    expect(item?.title).toBe("Restore me");

    const result = await listItems(db, USER_ID, { limit: 20 });
    expect(result.items.find((t) => t.id === seeded.id)).toBeDefined();
  });

  it("returns null for active (non-deleted) item", async () => {
    const seeded = await seedItem();

    const result = await restoreItem(db, USER_ID, seeded.id);

    expect(result).toBeNull();
  });

  it("returns null for another user's item", async () => {
    const seeded = await seedItem({ userId: OTHER_USER_ID, dateDeleted: new Date() });

    const result = await restoreItem(db, USER_ID, seeded.id);

    expect(result).toBeNull();
  });

  it("creates audit entry with action 'restore'", async () => {
    const seeded = await seedItem({ title: "Audit restore", dateDeleted: new Date() });

    await restoreItem(db, USER_ID, seeded.id);

    const entries = await db.select().from(itemAuditLogs).where(eq(itemAuditLogs.itemId, seeded.id));

    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe("restore");
    expect((entries[0].beforeState as Record<string, unknown>).dateDeleted).toBeDefined();
    expect((entries[0].afterState as Record<string, unknown>).dateDeleted).toBeNull();
  });
});

// ===================== purgeExpiredItems =====================

describe("purgeExpiredItems", () => {
  it("hard-deletes items deleted more than 30 days ago", async () => {
    const expired = new Date();
    expired.setDate(expired.getDate() - 31);
    const seeded = await seedItem({ dateDeleted: expired });

    const count = await purgeExpiredItems(db);

    expect(count).toBe(1);

    // Row is completely gone
    const [row] = await db.select().from(items).where(eq(items.id, seeded.id));
    expect(row).toBeUndefined();
  });

  it("keeps items deleted less than 30 days ago", async () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 10);
    const seeded = await seedItem({ dateDeleted: recent });

    const count = await purgeExpiredItems(db);

    expect(count).toBe(0);

    const [row] = await db.select().from(items).where(eq(items.id, seeded.id));
    expect(row).toBeDefined();
  });

  it("ignores active (non-deleted) items", async () => {
    await seedItem({ title: "Active item" });

    const count = await purgeExpiredItems(db);

    expect(count).toBe(0);
  });

  it("creates hard_delete audit entries", async () => {
    const expired = new Date();
    expired.setDate(expired.getDate() - 31);
    const seeded = await seedItem({ dateDeleted: expired });

    await purgeExpiredItems(db);

    const entries = await db.select().from(itemAuditLogs).where(eq(itemAuditLogs.itemId, seeded.id));

    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe("hard_delete");
    expect(entries[0].beforeState).toMatchObject({ title: "Seeded item" });
    expect(entries[0].afterState).toBeNull();
  });

  it("returns 0 when nothing is expired", async () => {
    const count = await purgeExpiredItems(db);

    expect(count).toBe(0);
  });
});
