import { OpenAPIHono } from "@hono/zod-openapi";
import type { AppEnv } from "../../../types";
import { handleListActivity } from "./handlers";
import { listActivity } from "./routes";

/** Item activity (audit log) routes. */
const activityRoute = new OpenAPIHono<AppEnv>({
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
}).openapi(listActivity, handleListActivity);

export { activityRoute };
