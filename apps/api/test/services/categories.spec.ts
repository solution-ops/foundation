import { categories } from "@foundation/db/schemas/categories";
import { tasks } from "@foundation/db/schemas/tasks";
import { users } from "@foundation/db/schemas/users";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  reorderCategories,
  updateCategory,
} from "../../src/services/categories";
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

// --- Helper to seed a task directly ---

async function seedTask(overrides: Partial<typeof tasks.$inferInsert> = {}) {
  const now = new Date();
  const [task] = await db
    .insert(tasks)
    .values({
      userId: USER_ID,
      title: "Seeded task",
      dateCreated: now,
      dateUpdated: now,
      ...overrides,
    })
    .returning();
  return task;
}

// ===================== createCategory =====================

describe("createCategory", () => {
  it("creates a category with all fields and returns it", async () => {
    const category = await createCategory(db, USER_ID, {
      name: "Work",
      color: "blue",
    });

    expect(category.id).toBeDefined();
    expect(category.name).toBe("Work");
    expect(category.color).toBe("blue");
    expect(category.userId).toBe(USER_ID);
    expect(category.order).toBe(0);
    expect(category.dateCreated).toBeDefined();
    expect(category.dateUpdated).toBeDefined();
  });

  it("auto-increments order for subsequent categories", async () => {
    const first = await createCategory(db, USER_ID, { name: "First", color: "red" });
    const second = await createCategory(db, USER_ID, { name: "Second", color: "blue" });
    const third = await createCategory(db, USER_ID, { name: "Third", color: "green" });

    expect(first.order).toBe(0);
    expect(second.order).toBe(1);
    expect(third.order).toBe(2);
  });

  it("rejects duplicate name for the same user", async () => {
    await createCategory(db, USER_ID, { name: "Work", color: "blue" });

    await expect(createCategory(db, USER_ID, { name: "Work", color: "red" })).rejects.toThrow(
      "A category with this name already exists",
    );
  });

  it("allows same name for different users", async () => {
    await createCategory(db, USER_ID, { name: "Work", color: "blue" });
    const other = await createCategory(db, OTHER_USER_ID, { name: "Work", color: "red" });

    expect(other.name).toBe("Work");
  });

  it("enforces max 20 categories limit", async () => {
    // Create 20 categories
    for (let i = 0; i < 20; i++) {
      await createCategory(db, USER_ID, { name: `Category ${i}`, color: "blue" });
    }

    await expect(createCategory(db, USER_ID, { name: "Category 21", color: "blue" })).rejects.toThrow(
      "Maximum of 20 categories allowed",
    );
  });
});

// ===================== listCategories =====================

describe("listCategories", () => {
  it("returns categories ordered by order field", async () => {
    await seedCategory({ name: "Third", order: 2 });
    await seedCategory({ name: "First", order: 0 });
    await seedCategory({ name: "Second", order: 1 });

    const result = await listCategories(db, USER_ID);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("First");
    expect(result[1].name).toBe("Second");
    expect(result[2].name).toBe("Third");
  });

  it("includes task counts", async () => {
    const category = await seedCategory({ name: "Work" });
    await seedTask({ categoryId: category.id });
    await seedTask({ categoryId: category.id });

    const result = await listCategories(db, USER_ID);

    expect(result[0].taskCount).toBe(2);
  });

  it("excludes soft-deleted tasks from count", async () => {
    const category = await seedCategory({ name: "Work" });
    await seedTask({ categoryId: category.id });
    await seedTask({ categoryId: category.id, dateDeleted: new Date() });

    const result = await listCategories(db, USER_ID);

    expect(result[0].taskCount).toBe(1);
  });

  it("returns zero task count for category with no tasks", async () => {
    await seedCategory({ name: "Empty" });

    const result = await listCategories(db, USER_ID);

    expect(result[0].taskCount).toBe(0);
  });

  it("returns only the current user's categories", async () => {
    await seedCategory({ name: "My category", userId: USER_ID });
    await seedCategory({ name: "Other category", userId: OTHER_USER_ID });

    const result = await listCategories(db, USER_ID);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("My category");
  });

  it("returns empty array when no categories exist", async () => {
    const result = await listCategories(db, USER_ID);

    expect(result).toEqual([]);
  });
});

// ===================== getCategory =====================

describe("getCategory", () => {
  it("returns the category when found", async () => {
    const seeded = await seedCategory({ name: "Work" });

    const category = await getCategory(db, USER_ID, seeded.id);

    expect(category).not.toBeNull();
    expect(category?.name).toBe("Work");
  });

  it("returns null for non-existent ID", async () => {
    const category = await getCategory(db, USER_ID, "nonexistent-id");

    expect(category).toBeNull();
  });

  it("returns null for another user's category", async () => {
    const seeded = await seedCategory({ userId: OTHER_USER_ID });

    const category = await getCategory(db, USER_ID, seeded.id);

    expect(category).toBeNull();
  });
});

// ===================== updateCategory =====================

describe("updateCategory", () => {
  it("updates name and returns the updated category", async () => {
    const seeded = await seedCategory({ name: "Original" });

    const updated = await updateCategory(db, USER_ID, seeded.id, { name: "Updated" });

    expect(updated).not.toBeNull();
    expect(updated?.name).toBe("Updated");
  });

  it("updates color", async () => {
    const seeded = await seedCategory({ color: "blue" });

    const updated = await updateCategory(db, USER_ID, seeded.id, { color: "red" });

    expect(updated?.color).toBe("red");
  });

  it("preserves untouched fields on partial update", async () => {
    const seeded = await seedCategory({ name: "Work", color: "blue" });

    const updated = await updateCategory(db, USER_ID, seeded.id, { color: "red" });

    expect(updated?.name).toBe("Work");
    expect(updated?.color).toBe("red");
  });

  it("sets dateUpdated to current time", async () => {
    const seeded = await seedCategory({ dateUpdated: new Date("2025-01-01") });
    const before = new Date();

    const updated = await updateCategory(db, USER_ID, seeded.id, { name: "Bump" });

    expect(updated?.dateUpdated.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it("rejects duplicate name for the same user", async () => {
    await seedCategory({ name: "Work" });
    const personal = await seedCategory({ name: "Personal" });

    await expect(updateCategory(db, USER_ID, personal.id, { name: "Work" })).rejects.toThrow(
      "A category with this name already exists",
    );
  });

  it("allows keeping the same name", async () => {
    const seeded = await seedCategory({ name: "Work" });

    const updated = await updateCategory(db, USER_ID, seeded.id, { name: "Work", color: "red" });

    expect(updated?.name).toBe("Work");
    expect(updated?.color).toBe("red");
  });

  it("returns null for non-existent or other user's category", async () => {
    const seeded = await seedCategory({ userId: OTHER_USER_ID });

    const result1 = await updateCategory(db, USER_ID, "nonexistent", { name: "X" });
    const result2 = await updateCategory(db, USER_ID, seeded.id, { name: "X" });

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });
});

// ===================== deleteCategory =====================

describe("deleteCategory", () => {
  it("deletes the category and returns true", async () => {
    const seeded = await seedCategory({ name: "Doomed" });

    const result = await deleteCategory(db, USER_ID, seeded.id);

    expect(result).toBe(true);

    const after = await getCategory(db, USER_ID, seeded.id);
    expect(after).toBeNull();
  });

  it("uncategorizes tasks when category is deleted", async () => {
    const category = await seedCategory({ name: "Work" });
    const task = await seedTask({ categoryId: category.id });

    await deleteCategory(db, USER_ID, category.id);

    const [updated] = await db.select().from(tasks).where(eq(tasks.id, task.id));

    expect(updated.categoryId).toBeNull();
  });

  it("returns false for non-existent category", async () => {
    const result = await deleteCategory(db, USER_ID, "nonexistent");

    expect(result).toBe(false);
  });

  it("returns false for another user's category", async () => {
    const seeded = await seedCategory({ userId: OTHER_USER_ID });

    const result = await deleteCategory(db, USER_ID, seeded.id);

    expect(result).toBe(false);
  });
});

// ===================== reorderCategories =====================

describe("reorderCategories", () => {
  it("reorders categories by array index", async () => {
    const a = await seedCategory({ name: "A", order: 0 });
    const b = await seedCategory({ name: "B", order: 1 });
    const c = await seedCategory({ name: "C", order: 2 });

    const result = await reorderCategories(db, USER_ID, [c.id, a.id, b.id]);

    expect(result).toBe(true);

    const ordered = await listCategories(db, USER_ID);
    expect(ordered[0].name).toBe("C");
    expect(ordered[1].name).toBe("A");
    expect(ordered[2].name).toBe("B");
  });

  it("returns false when any ID does not belong to user", async () => {
    const mine = await seedCategory({ name: "Mine" });
    const other = await seedCategory({ name: "Other", userId: OTHER_USER_ID });

    const result = await reorderCategories(db, USER_ID, [mine.id, other.id]);

    expect(result).toBe(false);
  });

  it("returns false for non-existent IDs", async () => {
    const result = await reorderCategories(db, USER_ID, ["nonexistent-id"]);

    expect(result).toBe(false);
  });
});
