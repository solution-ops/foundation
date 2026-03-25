import { CATEGORY_COLORS, MAX_CATEGORY_NAME_LENGTH } from "@foundation/constants/category-colors";
import { z } from "zod";

// --- Enums ---

export const categoryColorValues = CATEGORY_COLORS;
export const categoryColorSchema = z.enum(categoryColorValues);
export type CategoryColor = z.infer<typeof categoryColorSchema>;

// --- Response schemas (JSON wire format) ---

export const categorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  color: categoryColorSchema,
  order: z.number().int(),
  dateCreated: z.string().datetime(),
  dateUpdated: z.string().datetime(),
});

export const categoryWithCountSchema = categorySchema.extend({
  itemCount: z.number().int(),
});

export const categoryIdParamSchema = z.object({
  id: z.string(),
});

export const categoryResponseSchema = z.object({
  category: categorySchema,
});

export const categoryListResponseSchema = z.object({
  categories: z.array(categoryWithCountSchema),
});

export const categoryDeleteResponseSchema = z.object({
  message: z.string(),
});

// --- Request schemas ---

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(MAX_CATEGORY_NAME_LENGTH, `Name must be ${MAX_CATEGORY_NAME_LENGTH} characters or less`),
  color: categoryColorSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(MAX_CATEGORY_NAME_LENGTH, `Name must be ${MAX_CATEGORY_NAME_LENGTH} characters or less`)
    .optional(),
  color: categoryColorSchema.optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const reorderCategoriesSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one category ID is required"),
});

export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
