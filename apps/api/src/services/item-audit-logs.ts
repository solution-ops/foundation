import { type ItemAuditLog, itemAuditLogs } from "@foundation/db/schemas/item-audit-logs";
import type { Item } from "@foundation/db/schemas/items";
import type { ItemActivityQuery } from "@foundation/types/schemas/item-audit-logs";
import { and, desc, eq, lt, or } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// --- Types ---

type AuditAction = "create" | "update" | "delete" | "restore" | "hard_delete";

export interface ItemActivityResult {
  activity: Array<ItemAuditLog>;
  nextCursor: string | undefined;
  hasMore: boolean;
}

// --- Service functions ---

/**
 * Inserts an audit log entry. Designed to be called WITHIN a transaction
 * alongside the item mutation it records.
 */
export async function createAuditEntry(
  db: NodePgDatabase,
  params: {
    itemId: string;
    userId: string;
    action: AuditAction;
    beforeState: Item | null;
    afterState: Item | null;
  },
): Promise<ItemAuditLog> {
  const [entry] = await db
    .insert(itemAuditLogs)
    .values({
      itemId: params.itemId,
      userId: params.userId,
      action: params.action,
      beforeState: params.beforeState,
      afterState: params.afterState,
    })
    .returning();

  return entry;
}

/**
 * Lists audit entries for an item with cursor-based pagination.
 * Ordered by timestamp DESC (most recent first).
 */
export async function listItemActivity(
  db: NodePgDatabase,
  itemId: string,
  query: ItemActivityQuery,
): Promise<ItemActivityResult> {
  const conditions = [eq(itemAuditLogs.itemId, itemId)];

  if (query.cursor) {
    const cursor = decodeCursor(query.cursor);
    const cursorCondition = or(
      lt(itemAuditLogs.timestamp, new Date(cursor.timestamp)),
      and(eq(itemAuditLogs.timestamp, new Date(cursor.timestamp)), lt(itemAuditLogs.id, cursor.id)),
    );
    if (cursorCondition) {
      conditions.push(cursorCondition);
    }
  }

  const rows = await db
    .select()
    .from(itemAuditLogs)
    .where(and(...conditions))
    .orderBy(desc(itemAuditLogs.timestamp), desc(itemAuditLogs.id))
    .limit(query.limit + 1);

  const hasMore = rows.length > query.limit;
  const entries = hasMore ? rows.slice(0, query.limit) : rows;

  const nextCursor =
    hasMore && entries.length > 0
      ? encodeCursor(entries[entries.length - 1].timestamp, entries[entries.length - 1].id)
      : undefined;

  return { activity: entries, nextCursor, hasMore };
}

// --- Cursor helpers ---

interface AuditCursor {
  timestamp: string;
  id: string;
}

function encodeCursor(timestamp: Date, id: string): string {
  const payload: AuditCursor = { timestamp: timestamp.toISOString(), id };
  return btoa(JSON.stringify(payload));
}

function decodeCursor(cursor: string): AuditCursor {
  try {
    const parsed = JSON.parse(atob(cursor)) as AuditCursor;
    if (!parsed.timestamp || !parsed.id) {
      throw new Error("Invalid cursor");
    }
    return parsed;
  } catch {
    throw new Error("Invalid cursor format");
  }
}
