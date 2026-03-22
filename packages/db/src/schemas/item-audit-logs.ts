import { createId } from "@paralleldrive/cuid2";
import type { InferSelectModel } from "drizzle-orm";
import { index, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const itemAuditActionEnum = pgEnum("task_audit_action", [
  "create",
  "update",
  "delete",
  "restore",
  "hard_delete",
]);

export const itemAuditLogs = pgTable(
  "item_audit_logs",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey()
      .notNull(),
    itemId: text("item_id").notNull(), // NOT a FK — survives item hard-deletion
    userId: text("user_id").notNull(), // NOT a FK — survives user deletion
    action: itemAuditActionEnum().notNull(),
    beforeState: jsonb("before_state"),
    afterState: jsonb("after_state"),
    timestamp: timestamp("timestamp")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("item_audit_logs_item_id_idx").on(table.itemId),
    index("item_audit_logs_user_id_idx").on(table.userId),
    index("item_audit_logs_item_id_timestamp_idx").on(table.itemId, table.timestamp),
  ],
);

export type ItemAuditLog = InferSelectModel<typeof itemAuditLogs>;
