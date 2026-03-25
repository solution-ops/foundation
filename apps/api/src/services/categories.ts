import { MAX_CATEGORIES_PER_USER } from "@foundation/constants/category-colors";
import { type Category, categories } from "@foundation/db/schemas/categories";
import { items } from "@foundation/db/schemas/items";
import type { CreateCategoryInput, UpdateCategoryInput } from "@foundation/types/schemas/categories";
import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// --- Return types ---

export interface CategoryWithCount extends Category {
  itemCount: number;
}

// --- Service functions ---

export async function createCategory(
  db: NodePgDatabase,
  userId: string,
  input: CreateCategoryInput,
): Promise<Category> {
  return db.transaction(async (tx) => {
    // Check max categories limit
    const [{ value: currentCount }] = await tx
      .select({ value: count() })
      .from(categories)
      .where(eq(categories.userId, userId));

    if (currentCount >= MAX_CATEGORIES_PER_USER) {
      throw new Error(`Maximum of ${MAX_CATEGORIES_PER_USER} categories allowed`);
    }

    // Check name uniqueness per user
    const [existing] = await tx
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.name, input.name)));

    if (existing) {
      throw new Error("A category with this name already exists");
    }

    // Set order to max + 1
    const [maxOrder] = await tx
      .select({ value: sql<number>`coalesce(max(${categories.order}), -1)` })
      .from(categories)
      .where(eq(categories.userId, userId));

    const [category] = await tx
      .insert(categories)
      .values({
        userId,
        name: input.name,
        color: input.color,
        order: (maxOrder?.value ?? -1) + 1,
      })
      .returning();

    return category;
  });
}

export async function listCategories(db: NodePgDatabase, userId: string): Promise<Array<CategoryWithCount>> {
  const rows = await db
    .select({
      id: categories.id,
      userId: categories.userId,
      name: categories.name,
      color: categories.color,
      order: categories.order,
      dateCreated: categories.dateCreated,
      dateUpdated: categories.dateUpdated,
      itemCount: count(items.id),
    })
    .from(categories)
    .leftJoin(items, and(eq(items.categoryId, categories.id), isNull(items.dateDeleted)))
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(asc(categories.order));

  return rows.map((r) => ({
    ...r,
    itemCount: Number(r.itemCount),
  }));
}

export async function getCategory(db: NodePgDatabase, userId: string, categoryId: string): Promise<Category | null> {
  const [category] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

  return category ?? null;
}

export async function updateCategory(
  db: NodePgDatabase,
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

    if (!existing) return null;

    // Check name uniqueness if name is being changed
    if (input.name && input.name !== existing.name) {
      const [duplicate] = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.userId, userId), eq(categories.name, input.name)));

      if (duplicate) {
        throw new Error("A category with this name already exists");
      }
    }

    const [updated] = await tx
      .update(categories)
      .set({ ...input, dateUpdated: new Date() })
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .returning();

    return updated;
  });
}

export async function deleteCategory(db: NodePgDatabase, userId: string, categoryId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

    if (!existing) return false;

    // Explicitly uncategorize items (FK onDelete: "set null" also handles this,
    // but we do it explicitly so the dateUpdated is set correctly)
    await tx
      .update(items)
      .set({ categoryId: null, dateUpdated: new Date() })
      .where(and(eq(items.categoryId, categoryId), eq(items.userId, userId)));

    await tx.delete(categories).where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));

    return true;
  });
}

export async function reorderCategories(db: NodePgDatabase, userId: string, ids: Array<string>): Promise<boolean> {
  return db.transaction(async (tx) => {
    // Validate all IDs belong to the user
    const userCategories = await tx.select({ id: categories.id }).from(categories).where(eq(categories.userId, userId));

    const userCategoryIds = new Set(userCategories.map((c) => c.id));
    for (const id of ids) {
      if (!userCategoryIds.has(id)) return false;
    }

    // Update order based on array index
    for (let i = 0; i < ids.length; i++) {
      await tx
        .update(categories)
        .set({ order: i, dateUpdated: new Date() })
        .where(and(eq(categories.id, ids[i]), eq(categories.userId, userId)));
    }

    return true;
  });
}
