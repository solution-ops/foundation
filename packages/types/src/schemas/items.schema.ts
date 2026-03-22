import { itemPriorityEnum, itemStatusEnum } from "@foundation/db/schemas/items";
import { z } from "zod";

// --- Enums ---

export const itemStatusValues = itemStatusEnum.enumValues;
export const itemPriorityValues = itemPriorityEnum.enumValues;

export const itemStatusSchema = z.enum(itemStatusValues);
export const itemPrioritySchema = z.enum(itemPriorityValues);

export type ItemStatus = z.infer<typeof itemStatusSchema>;
export type ItemPriority = z.infer<typeof itemPrioritySchema>;

// --- Response schemas (JSON wire format) ---

export const itemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: itemStatusSchema,
  priority: itemPrioritySchema,
  dateDue: z.string().datetime().nullable(),
  dateCreated: z.string().datetime(),
  dateUpdated: z.string().datetime(),
  dateDeleted: z.string().datetime().nullable(),
  categoryId: z.string().nullable(),
});

export const itemIdParamSchema = z.object({
  id: z.string(),
});

export const itemResponseSchema = z.object({
  item: itemSchema,
});

export const itemListResponseSchema = z.object({
  items: z.array(itemSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});

export const itemDeleteResponseSchema = z.object({
  message: z.string(),
});

export const itemRestoreResponseSchema = z.object({
  item: itemSchema,
});

// --- Request schemas ---

export const createItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title too long"),
  description: z.string().max(5000, "Description too long").optional(),
  status: itemStatusSchema.optional(),
  priority: itemPrioritySchema.optional(),
  dateDue: z.coerce.date().optional(),
  categoryId: z.string().nullable().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(500, "Title too long").optional(),
  description: z.string().max(5000, "Description too long").nullable().optional(),
  status: itemStatusSchema.optional(),
  priority: itemPrioritySchema.optional(),
  dateDue: z.coerce.date().nullable().optional(),
  categoryId: z.string().nullable().optional(),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const listItemsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().optional(),
  status: itemStatusSchema.optional(),
  priority: itemPrioritySchema.optional(),
  deleted: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => val === "true"),
  category: z.string().optional(),
});

export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;
