import type { ZodType } from "zod";
import { apiErrorResponseSchema } from "../schemas/shared";

/** Wraps a Zod schema in the OpenAPI JSON content structure. */
export function jsonContent<T extends ZodType>(schema: T, description: string) {
  return {
    content: { "application/json": { schema } },
    description,
  };
}

/** Standard 400 Validation Error response for OpenAPI routes. */
export function validationErrorResponse() {
  return { 400: jsonContent(apiErrorResponseSchema, "Validation error") } as const;
}

/** Standard 401 Unauthorized response for OpenAPI routes. */
export function unauthorizedResponse() {
  return { 401: jsonContent(apiErrorResponseSchema, "Unauthorized") } as const;
}

/** Standard 404 Not Found response for OpenAPI routes. */
export function notFoundResponse() {
  return { 404: jsonContent(apiErrorResponseSchema, "Not found") } as const;
}

/** Standard 429 Rate Limit response for OpenAPI routes. */
export function rateLimitResponse() {
  return { 429: jsonContent(apiErrorResponseSchema, "Too many requests") } as const;
}

/** Standard 409 Conflict response for OpenAPI routes. */
export function conflictResponse() {
  return { 409: jsonContent(apiErrorResponseSchema, "Conflict") } as const;
}
