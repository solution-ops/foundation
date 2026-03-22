import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../types";
import { activityRoute } from "./activity";
import { handleCreate, handleGet, handleList, handleRemove, handleRestore, handleUpdate } from "./handlers";
import { create, get, list, remove, restore, update } from "./routes";

/** Item CRUD routes — chained for Hono RPC type inference. */
const itemsRoute = new OpenAPIHono<AppEnv>({
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
  .openapi(get, handleGet)
  .openapi(update, handleUpdate)
  .openapi(remove, handleRemove)
  .openapi(restore, handleRestore)
  .route("/", activityRoute);

export { itemsRoute };
