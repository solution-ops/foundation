import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";
import type { AppEnv } from "../types";

/**
 * Error types that can be handled by the API
 */
export type ApiErrorType =
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "EXTERNAL_SERVICE_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND_ERROR"
  | "RATE_LIMIT_ERROR"
  | "INTERNAL_ERROR";

/**
 * Standard error response structure
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  type: ApiErrorType;
  data?: unknown;
  timestamp: string;
}

/**
 * Creates a standardized API error as an HTTPException
 */
export function createApiError(
  status: ContentfulStatusCode,
  message: string,
  type: ApiErrorType,
  data?: unknown,
): HTTPException {
  const body: ApiErrorResponse = {
    status,
    message,
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  return new HTTPException(status, {
    message,
    res: new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  });
}

/**
 * Handles common error patterns and converts them to appropriate API errors
 */
export function handleApiError(error: unknown, context?: string): never {
  // Log the error with context
  console.error(`${context ? `[${context}] ` : ""}Error:`, error);

  // If it's already an HTTPException, re-throw it
  if (error instanceof HTTPException) {
    throw error;
  }

  // Handle different error types
  if (error instanceof Error) {
    // Validation errors
    if (error.name === "ZodError") {
      throw createApiError(400, "Validation failed", "VALIDATION_ERROR", error);
    }

    // Database errors
    if (
      error.message.includes("database") ||
      error.message.includes("connection") ||
      error.message.includes("sql") ||
      error.message.includes("duplicate")
    ) {
      throw createApiError(503, "Service temporarily unavailable", "DATABASE_ERROR");
    }

    // External service errors
    if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("timeout")) {
      throw createApiError(503, "External service unavailable", "EXTERNAL_SERVICE_ERROR");
    }

    // Authentication errors
    if (
      error.message.includes("unauthorized") ||
      error.message.includes("invalid token") ||
      error.message.includes("expired")
    ) {
      throw createApiError(401, "Authentication required", "AUTHENTICATION_ERROR");
    }

    // Authorization errors
    if (error.message.includes("forbidden") || error.message.includes("permission")) {
      throw createApiError(403, "Access denied", "AUTHORIZATION_ERROR");
    }

    // Not found errors
    if (error.message.includes("not found") || error.message.includes("does not exist")) {
      throw createApiError(404, "Resource not found", "NOT_FOUND_ERROR");
    }

    // Rate limit errors
    if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
      throw createApiError(429, "Too many requests", "RATE_LIMIT_ERROR");
    }
  }

  // Default error for unknown cases
  throw createApiError(500, "Internal server error", "INTERNAL_ERROR");
}

/**
 * Wraps an async function with error handling
 */
export function withErrorHandling<T extends Array<unknown>, R>(fn: (...args: T) => Promise<R>, context?: string) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleApiError(error, context);
    }
  };
}

/**
 * Validates that required fields are present in form data
 */
export function validateRequiredFields(formData: FormData, requiredFields: Array<string>): Record<string, string> {
  const data: Record<string, string> = {};
  const missingFields: Array<string> = [];

  for (const field of requiredFields) {
    const value = formData.get(field)?.toString() ?? "";
    if (!value.trim()) {
      missingFields.push(field);
    }
    data[field] = value;
  }

  if (missingFields.length > 0) {
    throw createApiError(400, `Missing required fields: ${missingFields.join(", ")}`, "VALIDATION_ERROR", {
      missingFields,
    });
  }

  return data;
}

/**
 * Global error handler for `app.onError()`.
 *
 * Catches HTTPException (including our ApiErrors) and unknown errors,
 * returning a consistent JSON response.
 */
export function onError(err: Error, c: Context<AppEnv>) {
  // Zod validation errors → 400
  if (err instanceof ZodError) {
    const body: ApiErrorResponse = {
      status: 400,
      message: "Validation failed",
      type: "VALIDATION_ERROR",
      data: err.issues,
      timestamp: new Date().toISOString(),
    };
    return c.json(body, 400);
  }

  if (err instanceof HTTPException) {
    // If the HTTPException has a custom response (from createApiError), use it
    if (err.res) {
      return err.res;
    }
    const body: ApiErrorResponse = {
      status: err.status,
      message: err.message,
      type: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    };
    return c.json(body, err.status);
  }

  console.error("Unhandled error:", err);
  const body: ApiErrorResponse = {
    status: 500,
    message: "Internal server error",
    type: "INTERNAL_ERROR",
    timestamp: new Date().toISOString(),
  };
  return c.json(body, 500);
}
