import { createId } from "@paralleldrive/cuid2";
import type { InferSelectModel } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { users } from "./users";

export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey()
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull(),
    order: integer("order").notNull().default(0),
    dateCreated: timestamp("date_created")
      .$defaultFn(() => new Date())
      .notNull(),
    dateUpdated: timestamp("date_updated")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("categories_user_id_idx").on(table.userId),
    unique("categories_user_id_name_unique").on(table.userId, table.name),
  ],
);

export type Category = InferSelectModel<typeof categories>;
