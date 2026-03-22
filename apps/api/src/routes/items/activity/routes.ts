import { createRoute } from "@hono/zod-openapi";
import { itemActivityQuerySchema, itemActivityResponseSchema } from "@foundation/types/schemas/item-audit-logs";
import { itemIdParamSchema } from "@foundation/types/schemas/items";
import {
  jsonContent,
  notFoundResponse,
  rateLimitResponse,
  unauthorizedResponse,
} from "../../../utils/openapi-responses";
import { requireAuth } from "../../../utils/require-auth";

export const listActivity = createRoute({
  method: "get",
  path: "/{id}/activity",
  tags: ["Items"],
  summary: "List activity (audit log) for an item",
  middleware: [requireAuth] as const,
  request: {
    params: itemIdParamSchema,
    query: itemActivityQuerySchema,
  },
  responses: {
    200: jsonContent(itemActivityResponseSchema, "Item activity retrieved successfully"),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
    ...notFoundResponse(),
  },
});
