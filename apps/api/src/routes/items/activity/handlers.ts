import type { RouteHandler } from "@hono/zod-openapi";
import { listItemActivity } from "../../../services/item-audit-logs";
import { getItem } from "../../../services/items";
import type { AppEnv } from "../../../types";
import { createApiError } from "../../../utils/error-handler";
import type { listActivity } from "./routes";

export const handleListActivity: RouteHandler<typeof listActivity, AppEnv> = async (c) => {
  const { id } = c.req.valid("param");
  const query = c.req.valid("query");
  const db = c.get("db");
  const userId = c.get("user").id;

  // Verify the user owns this item
  const item = await getItem(db, userId, id);
  if (!item) {
    throw createApiError(404, "Item not found", "NOT_FOUND_ERROR");
  }

  try {
    const result = await listItemActivity(db, id, query);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid cursor")) {
      throw createApiError(400, "Invalid cursor", "VALIDATION_ERROR");
    }
    throw error;
  }
};
