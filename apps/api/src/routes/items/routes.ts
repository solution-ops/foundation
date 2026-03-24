import {
  createItemSchema,
  itemDeleteResponseSchema,
  itemIdParamSchema,
  itemListResponseSchema,
  itemResponseSchema,
  itemRestoreResponseSchema,
  listItemsQuerySchema,
  updateItemSchema,
} from "@foundation/types/schemas/items";
import { createRoute } from "@hono/zod-openapi";
import {
  jsonContent,
  notFoundResponse,
  rateLimitResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "../../utils/openapi-responses";
import { requireAuth } from "../../utils/require-auth";

export const create = createRoute({
  method: "post",
  path: "/",
  tags: ["Items"],
  summary: "Create an item",
  middleware: [requireAuth] as const,
  request: {
    body: { content: { "application/json": { schema: createItemSchema } }, required: true },
  },
  responses: {
    201: jsonContent(itemResponseSchema, "Item created successfully"),
    ...validationErrorResponse(),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
  },
});

export const list = createRoute({
  method: "get",
  path: "/",
  tags: ["Items"],
  summary: "List items with cursor-based pagination",
  middleware: [requireAuth] as const,
  request: { query: listItemsQuerySchema },
  responses: {
    200: jsonContent(itemListResponseSchema, "Item list retrieved successfully"),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
  },
});

export const get = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Items"],
  summary: "Get an item by ID",
  middleware: [requireAuth] as const,
  request: { params: itemIdParamSchema },
  responses: {
    200: jsonContent(itemResponseSchema, "Item retrieved successfully"),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
    ...notFoundResponse(),
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Items"],
  summary: "Update an item",
  middleware: [requireAuth] as const,
  request: {
    params: itemIdParamSchema,
    body: { content: { "application/json": { schema: updateItemSchema } }, required: true },
  },
  responses: {
    200: jsonContent(itemResponseSchema, "Item updated successfully"),
    ...validationErrorResponse(),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
    ...notFoundResponse(),
  },
});

export const remove = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Items"],
  summary: "Delete an item",
  middleware: [requireAuth] as const,
  request: { params: itemIdParamSchema },
  responses: {
    200: jsonContent(itemDeleteResponseSchema, "Item moved to trash"),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
    ...notFoundResponse(),
  },
});

export const restore = createRoute({
  method: "post",
  path: "/{id}/restore",
  tags: ["Items"],
  summary: "Restore a deleted item",
  middleware: [requireAuth] as const,
  request: { params: itemIdParamSchema },
  responses: {
    200: jsonContent(itemRestoreResponseSchema, "Item restored successfully"),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
    ...notFoundResponse(),
  },
});
