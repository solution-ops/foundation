import { z } from "zod";

/**
 * Zod schema matching the ApiErrorResponse interface in error-handler.ts.
 * Used in OpenAPI route definitions to document error responses.
 */
export const apiErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  type: z.enum([
    "VALIDATION_ERROR",
    "DATABASE_ERROR",
    "EXTERNAL_SERVICE_ERROR",
    "AUTHENTICATION_ERROR",
    "AUTHORIZATION_ERROR",
    "NOT_FOUND_ERROR",
    "RATE_LIMIT_ERROR",
    "INTERNAL_ERROR",
  ]),
  data: z.unknown().optional(),
  timestamp: z.string(),
});
