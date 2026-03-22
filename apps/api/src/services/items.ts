import { categories } from "@foundation/db/schemas/categories";
import { itemAuditLogs } from "@foundation/db/schemas/item-audit-logs";
import { type Item, items } from "@foundation/db/schemas/items";
import { decodeCursor, encodeCursor } from "@foundation/db/validators/items";
import type { CreateItemInput, UpdateItemInput } from "@foundation/types/schemas/items";
import { and, desc, eq, isNotNull, isNull, lt, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { createAuditEntry } from "./item-audit-logs";

// --- Constants ---

const SOFT_DELETE_RETENTION_DAYS = 30;

// --- Return types ---

export interface ItemListResult {
  items: Array<Item>;
  nextCursor: string | undefined;
  hasMore: boolean;
}

// --- Helpers ---

async function validateCategoryOwnership(
  tx: NodePgDatabase,
  categoryId: string | null | undefined,
  userId: string,
): Promise<void> {
  if (!categoryId) return;
  const [cat] = await tx
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
  if (!cat) {
    throw new Error("Category not found");
  }
}

// --- Service functions ---

export async function createItem(db: NodePgDatabase, userId: string, input: CreateItemInput): Promise<Item> {
  return db.transaction(async (tx) => {
    await validateCategoryOwnership(tx, input.categoryId, userId);

    const [item] = await tx
      .insert(items)
      .values({
        userId,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        dateDue: input.dateDue,
        categoryId: input.categoryId,
      })
      .returning();

    await createAuditEntry(tx, {
      itemId: item.id,
      userId,
      action: "create",
      beforeState: null,
      afterState: item,
    });

    return item;
  });
}

export interface ListItemsParams {
  limit: number;
  cursor?: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "none" | "low" | "medium" | "high" | "urgent";
  deleted?: boolean;
  category?: string;
}

export async function listItems(db: NodePgDatabase, userId: string, query: ListItemsParams): Promise<ItemListResult> {
  const conditions = [eq(items.userId, userId)];

  // Show deleted items (trash view) or active items (default)
  if (query.deleted) {
    conditions.push(isNotNull(items.dateDeleted));
  } else {
    conditions.push(isNull(items.dateDeleted));
  }

  if (query.status) {
    conditions.push(eq(items.status, query.status));
  }
  if (query.priority) {
    conditions.push(eq(items.priority, query.priority));
  }
  if (query.category) {
    conditions.push(eq(items.categoryId, query.category));
  }

  // Cursor-based pagination: (dateCreated DESC, id DESC)
  if (query.cursor) {
    const cursor = decodeCursor(query.cursor);
    const cursorCondition = or(
      lt(items.dateCreated, new Date(cursor.dateCreated)),
      and(eq(items.dateCreated, new Date(cursor.dateCreated)), lt(items.id, cursor.id)),
    );
    if (cursorCondition) {
      conditions.push(cursorCondition);
    }
  }

  // Fetch limit + 1 to determine hasMore
  const rows = await db
    .select()
    .from(items)
    .where(and(...conditions))
    .orderBy(desc(items.dateCreated), desc(items.id))
    .limit(query.limit + 1);

  const hasMore = rows.length > query.limit;
  const pageItems = hasMore ? rows.slice(0, query.limit) : rows;

  const nextCursor =
    hasMore && pageItems.length > 0
      ? encodeCursor(pageItems[pageItems.length - 1].dateCreated, pageItems[pageItems.length - 1].id)
      : undefined;

  return { items: pageItems, nextCursor, hasMore };
}

export async function getItem(db: NodePgDatabase, userId: string, itemId: string): Promise<Item | null> {
  const [item] = await db
    .select()
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.userId, userId), isNull(items.dateDeleted)));

  return item ?? null;
}

export async function updateItem(
  db: NodePgDatabase,
  userId: string,
  itemId: string,
  input: UpdateItemInput,
): Promise<Item | null> {
  return db.transaction(async (tx) => {
    // Fetch current state BEFORE update (must not be soft-deleted)
    const [beforeItem] = await tx
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, userId), isNull(items.dateDeleted)));

    if (!beforeItem) return null;

    await validateCategoryOwnership(tx, input.categoryId, userId);

    const [updatedItem] = await tx
      .update(items)
      .set({
        ...input,
        dateUpdated: new Date(),
      })
      .where(and(eq(items.id, itemId), eq(items.userId, userId)))
      .returning();

    await createAuditEntry(tx, {
      itemId,
      userId,
      action: "update",
      beforeState: beforeItem,
      afterState: updatedItem,
    });

    return updatedItem;
  });
}

export async function deleteItem(db: NodePgDatabase, userId: string, itemId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    // Fetch current state (must not already be soft-deleted)
    const [beforeItem] = await tx
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, userId), isNull(items.dateDeleted)));

    if (!beforeItem) return false;

    const [afterItem] = await tx
      .update(items)
      .set({ dateDeleted: new Date(), dateUpdated: new Date() })
      .where(and(eq(items.id, itemId), eq(items.userId, userId)))
      .returning();

    await createAuditEntry(tx, {
      itemId,
      userId,
      action: "delete",
      beforeState: beforeItem,
      afterState: afterItem,
    });

    return true;
  });
}

export async function restoreItem(db: NodePgDatabase, userId: string, itemId: string): Promise<Item | null> {
  return db.transaction(async (tx) => {
    // Fetch the soft-deleted item (must have dateDeleted set)
    const [beforeItem] = await tx
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), eq(items.userId, userId), isNotNull(items.dateDeleted)));

    if (!beforeItem) return null;

    const [restoredItem] = await tx
      .update(items)
      .set({ dateDeleted: null, dateUpdated: new Date() })
      .where(and(eq(items.id, itemId), eq(items.userId, userId)))
      .returning();

    await createAuditEntry(tx, {
      itemId,
      userId,
      action: "restore",
      beforeState: beforeItem,
      afterState: restoredItem,
    });

    return restoredItem;
  });
}

/**
 * Hard-deletes items that have been soft-deleted for more than 30 days.
 * Called by the scheduled cron handler.
 */
export async function purgeExpiredItems(db: NodePgDatabase): Promise<number> {
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - SOFT_DELETE_RETENTION_DAYS);

  return db.transaction(async (tx) => {
    // DELETE ... RETURNING gives us exactly the rows that were hard-deleted,
    // avoiding a TOCTOU race where a concurrent restore could clear dateDeleted
    // between a SELECT and DELETE.
    const deletedItems = await tx
      .delete(items)
      .where(and(isNotNull(items.dateDeleted), lt(items.dateDeleted, threshold)))
      .returning();

    if (deletedItems.length === 0) return 0;

    // Audit entries are derived from the actually-deleted rows
    await tx.insert(itemAuditLogs).values(
      deletedItems.map((item) => ({
        itemId: item.id,
        userId: item.userId,
        action: "hard_delete" as const,
        beforeState: item,
        afterState: null,
      })),
    );

    return deletedItems.length;
  });
}
