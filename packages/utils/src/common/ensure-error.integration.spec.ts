import { describe, expect, it } from "vitest";
import { ensureError } from "./ensure-error";

describe("ensureError - Integration Tests", () => {
  it("should handle real-world API error scenarios", () => {
    // Simulate fetch API error
    const fetchError = new TypeError("Failed to fetch");
    const result = ensureError(fetchError);

    expect(result).toBe(fetchError);
    expect(result.message).toBe("Failed to fetch");
  });

  it("should handle database connection errors", () => {
    const dbError = {
      code: "ECONNREFUSED",
      errno: -61,
      syscall: "connect",
      address: "127.0.0.1",
      port: 5432,
    };

    const result = ensureError(dbError);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toContain("ECONNREFUSED");
  });

  it("should handle validation errors from form libraries", () => {
    const validationError = {
      name: "ValidationError",
      errors: {
        email: ["Email is required"],
        password: ["Password must be at least 8 characters"],
      },
    };

    const result = ensureError(validationError);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toContain("ValidationError");
    expect(result.message).toContain("Email is required");
  });

  it("should handle async operation rejections", async () => {
    const asyncError = Promise.reject("Async operation failed");

    try {
      await asyncError;
    } catch (error) {
      const result = ensureError(error);
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toContain("Async operation failed");
    }
  });

  it("should handle nested error structures", () => {
    const nestedError = {
      error: {
        details: {
          message: "Nested error message",
          code: 500,
        },
      },
    };

    const result = ensureError(nestedError);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toContain("Nested error message");
  });

  it("should preserve stack traces when possible", () => {
    const originalError = new Error("Original error");
    const result = ensureError(originalError);

    expect(result).toBe(originalError);
    expect(result.stack).toBeDefined();
  });

  it("should handle browser-specific errors", () => {
    // Simulate DOMException
    const domError = {
      name: "NotAllowedError",
      message: "The request is not allowed by the user agent",
      code: 0,
    };

    const result = ensureError(domError);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toContain("NotAllowedError");
  });

  it("should handle authentication errors", () => {
    const authError = {
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials",
      data: {
        reason: "expired_token",
      },
    };

    const result = ensureError(authError);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("[Unauthorized] Invalid credentials");
    // @ts-expect-error
    expect(result.cause).toBe(authError);
  });
});
