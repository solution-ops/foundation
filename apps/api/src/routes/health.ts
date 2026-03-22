import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "../types";

const healthResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

const healthRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Health"],
  summary: "Health check",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: healthResponseSchema,
        },
      },
      description: "Service is healthy",
    },
  },
});

const health = new OpenAPIHono<AppEnv>();

health.openapi(healthRoute, (c) => {
  return c.json(
    {
      status: "ok",
      message: "hello from@foundation/api health route",
      timestamp: new Date().toISOString(),
    },
    200,
  );
});

export { health };
