import { createId } from "@paralleldrive/cuid2";
import type { InferSelectModel } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// local dependencies
import { categories } from "./categories";
import { users } from "./users";

export const itemStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done"]);
export const itemPriorityEnum = pgEnum("task_priority", ["none", "low", "medium", "high", "urgent"]);

export const items = pgTable(
  "items",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey()
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: itemStatusEnum().notNull().default("todo"),
    priority: itemPriorityEnum().notNull().default("none"),
    dateDue: timestamp("date_due"),
    dateCreated: timestamp("date_created")
      .$defaultFn(() => new Date())
      .notNull(),
    dateUpdated: timestamp("date_updated")
      .$defaultFn(() => new Date())
      .notNull(),
    dateDeleted: timestamp("date_deleted"),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  },
  (table) => [
    index("items_user_id_idx").on(table.userId),
    index("items_user_id_status_idx").on(table.userId, table.status),
    index("items_date_deleted_idx").on(table.dateDeleted),
    index("items_user_id_category_id_idx").on(table.userId, table.categoryId),
  ],
);

export type Item = InferSelectModel<typeof items>;
