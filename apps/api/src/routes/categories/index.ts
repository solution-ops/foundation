import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../types";
import { handleCreate, handleList, handleRemove, handleReorder, handleUpdate } from "./handlers";
import { create, list, remove, reorder, update } from "./routes";

/** Category CRUD routes — chained for Hono RPC type inference. */
const categoriesRoute = new OpenAPIHono<AppEnv>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          status: 400 as const,
          message: "Validation failed",
          type: "VALIDATION_ERROR" as const,
          data: result.error.issues,
          timestamp: new Date().toISOString(),
        },
        400,
      );
    }
  },
})
  .openapi(create, handleCreate)
  .openapi(list, handleList)
  .openapi(reorder, handleReorder)
  .openapi(update, handleUpdate)
  .openapi(remove, handleRemove);

export { categoriesRoute };
