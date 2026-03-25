import {
  categoryDeleteResponseSchema,
  categoryIdParamSchema,
  categoryListResponseSchema,
  categoryResponseSchema,
  createCategorySchema,
  reorderCategoriesSchema,
  updateCategorySchema,
} from "@foundation/types/schemas/categories";
import { createRoute } from "@hono/zod-openapi";
import {
  conflictResponse,
  jsonContent,
  rateLimitResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "../../utils/openapi-responses";
import { requireAuth } from "../../utils/require-auth";

export const create = createRoute({
  method: "post",
  path: "/",
  tags: ["Categories"],
  summary: "Create a category",
  middleware: [requireAuth] as const,
  request: {
    body: { content: { "application/json": { schema: createCategorySchema } }, required: true },
  },
  responses: {
    201: jsonContent(categoryResponseSchema, "Category created successfully"),
    ...validationErrorResponse(),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
    ...conflictResponse(),
  },
});

export const list = createRoute({
  method: "get",
  path: "/",
  tags: ["Categories"],
  summary: "List categories with item counts",
  middleware: [requireAuth] as const,
  responses: {
    200: jsonContent(categoryListResponseSchema, "Category list retrieved successfully"),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
  },
});

export const reorder = createRoute({
  method: "patch",
  path: "/reorder",
  tags: ["Categories"],
  summary: "Reorder categories",
  middleware: [requireAuth] as const,
  request: {
    body: { content: { "application/json": { schema: reorderCategoriesSchema } }, required: true },
  },
  responses: {
    200: jsonContent(categoryListResponseSchema, "Categories reordered successfully"),
    ...validationErrorResponse(),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
  },
});

export const update = createRoute({
  method: "patch",
  path: "/{id}",
  tags: ["Categories"],
  summary: "Update a category",
  middleware: [requireAuth] as const,
  request: {
    params: categoryIdParamSchema,
    body: { content: { "application/json": { schema: updateCategorySchema } }, required: true },
  },
  responses: {
    200: jsonContent(categoryResponseSchema, "Category updated successfully"),
    ...validationErrorResponse(),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
    ...conflictResponse(),
  },
});

export const remove = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Categories"],
  summary: "Delete a category",
  middleware: [requireAuth] as const,
  request: { params: categoryIdParamSchema },
  responses: {
    200: jsonContent(categoryDeleteResponseSchema, "Category deleted successfully"),
    ...unauthorizedResponse(),
    ...rateLimitResponse(),
  },
});
