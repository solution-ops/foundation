import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import type { AppEnv } from "../types";

const aboutResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

const aboutRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["About"],
  summary: "About this API",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: aboutResponseSchema,
        },
      },
      description: "About information",
    },
  },
});

const about = new OpenAPIHono<AppEnv>();

about.openapi(aboutRoute, (c) => {
  return c.json(
    {
      status: "ok",
      message: "hello from@foundation/api about route",
      timestamp: new Date().toISOString(),
    },
    200,
  );
});

export { about };
