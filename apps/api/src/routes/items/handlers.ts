import type { RouteHandler } from "@hono/zod-openapi";
import { createItem, deleteItem, getItem, listItems, restoreItem, updateItem } from "../../services/items";
import type { AppEnv } from "../../types";
import { createApiError } from "../../utils/error-handler";
import type { create, get, list, remove, restore, update } from "./routes";

export const handleCreate: RouteHandler<typeof create, AppEnv> = async (c) => {
  const input = c.req.valid("json");
  const item = await createItem(c.get("db"), c.get("user").id, input);
  return c.json({ item }, 201);
};

export const handleList: RouteHandler<typeof list, AppEnv> = async (c) => {
  const query = c.req.valid("query");
  const result = await listItems(c.get("db"), c.get("user").id, query);
  return c.json(result, 200);
};

export const handleGet: RouteHandler<typeof get, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const item = await getItem(c.get("db"), c.get("user").id, id);

  if (!item) {
    throw createApiError(404, "Item not found", "NOT_FOUND_ERROR");
  }

  return c.json({ item }, 200);
};

export const handleUpdate: RouteHandler<typeof update, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const input = c.req.valid("json");
  const item = await updateItem(c.get("db"), c.get("user").id, id, input);

  if (!item) {
    throw createApiError(404, "Item not found", "NOT_FOUND_ERROR");
  }

  return c.json({ item }, 200);
};

export const handleRemove: RouteHandler<typeof remove, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const deleted = await deleteItem(c.get("db"), c.get("user").id, id);

  if (!deleted) {
    throw createApiError(404, "Item not found", "NOT_FOUND_ERROR");
  }

  return c.json({ message: "Item moved to trash" }, 200);
};

export const handleRestore: RouteHandler<typeof restore, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const item = await restoreItem(c.get("db"), c.get("user").id, id);

  if (!item) {
    throw createApiError(404, "Item not found", "NOT_FOUND_ERROR");
  }

  return c.json({ item }, 200);
};
