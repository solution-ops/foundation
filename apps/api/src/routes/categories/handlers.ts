import type { CategoryColor } from "@foundation/constants/category-colors";
import type { RouteHandler } from "@hono/zod-openapi";
import {
  createCategory,
  deleteCategory,
  listCategories,
  reorderCategories,
  updateCategory,
} from "../../services/categories";
import type { AppEnv } from "../../types";
import { createApiError } from "../../utils/error-handler";
import type { create, list, remove, reorder, update } from "./routes";

/**
 * Casts the `color` field from the DB's generic `string` to the validated
 * `CategoryColor` union. Safe because all writes go through Zod validation.
 */
function withTypedColor<T extends { color: string }>(obj: T): T & { color: CategoryColor } {
  return obj as T & { color: CategoryColor };
}

export const handleCreate: RouteHandler<typeof create, AppEnv> = async (c) => {
  const input = c.req.valid("json");
  try {
    const category = withTypedColor(await createCategory(c.get("db"), c.get("user").id, input));
    return c.json({ category }, 201);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("already exists")) {
        throw createApiError(409, err.message, "VALIDATION_ERROR");
      }
      if (err.message.includes("Maximum")) {
        throw createApiError(409, err.message, "VALIDATION_ERROR");
      }
    }
    throw err;
  }
};

export const handleList: RouteHandler<typeof list, AppEnv> = async (c) => {
  const categories = (await listCategories(c.get("db"), c.get("user").id)).map(withTypedColor);
  return c.json({ categories }, 200);
};

export const handleReorder: RouteHandler<typeof reorder, AppEnv> = async (c) => {
  const { ids } = c.req.valid("json");
  const db = c.get("db");
  const userId = c.get("user").id;

  const success = await reorderCategories(db, userId, ids);
  if (!success) {
    throw createApiError(400, "Invalid category IDs", "VALIDATION_ERROR");
  }

  // Return the updated list
  const categories = (await listCategories(db, userId)).map(withTypedColor);
  return c.json({ categories }, 200);
};

export const handleUpdate: RouteHandler<typeof update, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  try {
    const result = await updateCategory(c.get("db"), c.get("user").id, id, input);
    if (!result) {
      throw createApiError(404, "Category not found", "NOT_FOUND_ERROR");
    }
    const category = withTypedColor(result);
    return c.json({ category }, 200);
  } catch (err) {
    if (err instanceof Error && err.message.includes("already exists")) {
      throw createApiError(409, err.message, "VALIDATION_ERROR");
    }
    throw err;
  }
};

export const handleRemove: RouteHandler<typeof remove, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const deleted = await deleteCategory(c.get("db"), c.get("user").id, id);
  if (!deleted) {
    throw createApiError(404, "Category not found", "NOT_FOUND_ERROR");
  }
  return c.json({ message: "Category deleted" }, 200);
};
