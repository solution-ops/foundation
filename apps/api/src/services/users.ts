import { categories } from "@foundation/db/schemas/categories";
import { itemAuditLogs } from "@foundation/db/schemas/item-audit-logs";
import { items } from "@foundation/db/schemas/items";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

/**
 * Deletes all user-owned data in a single transaction.
 * Called by Better Auth's `beforeDelete` hook before the user row is removed.
 *
 * Order matters: audit logs → items → categories (FK constraints).
 */
export async function deleteUserData(db: NodePgDatabase, userId: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(itemAuditLogs).where(eq(itemAuditLogs.userId, userId));
    await tx.delete(items).where(eq(items.userId, userId));
    await tx.delete(categories).where(eq(categories.userId, userId));
  });
}
