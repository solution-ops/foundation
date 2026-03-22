import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ensureError } from "./ensure-error";

describe("ensureError", () => {
  // Spy on console methods
  beforeEach(() => {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: meh
    vi.spyOn(console, "error").mockImplementation(() => {});
    // biome-ignore lint/suspicious/noEmptyBlockStatements: meh
    vi.spyOn(console, "info").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the original error if value is already an Error", () => {
    const originalError = new Error("test error");
    const result = ensureError(originalError);
    expect(result).toBe(originalError);
  });

  it("should handle H3Error correctly", () => {
    const h3Error = {
      statusCode: 404,
      statusMessage: "Not Found",
      message: "Resource not found",
    };

    const result = ensureError(h3Error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("[Not Found] Resource not found");
    // @ts-expect-error
    expect(result.cause).toBe(h3Error);
    expect(console.error).toHaveBeenCalledWith("H3Error was thrown: ", h3Error);
  });

  it("should handle H3Error with only statusMessage", () => {
    const h3Error = {
      statusCode: 500,
      statusMessage: "Internal Server Error",
    };

    const result = ensureError(h3Error);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("[Internal Server Error] Internal Server Error");
    // @ts-expect-error
    expect(result.cause).toBe(h3Error);
  });

  it("should handle non-error objects that can be stringified", () => {
    const value = { foo: "bar" };
    const result = ensureError(value);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('This value was thrown as is, not through an Error: {"foo":"bar"}');
    expect(console.info).toHaveBeenCalledWith("Value was thrown as is, not through an Error: ", value);
  });

  it("should handle values that cannot be stringified", () => {
    const circular: any = {};
    circular.self = circular;

    const result = ensureError(circular);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(
      "This value was thrown as is, not through an Error: [Unable to stringify the thrown value]",
    );
    expect(console.info).toHaveBeenCalledWith("Value was thrown as is, not through an Error: ", circular);
  });

  it("should handle primitive values", () => {
    const result = ensureError("test string");

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('This value was thrown as is, not through an Error: "test string"');
    expect(console.info).toHaveBeenCalledWith("Value was thrown as is, not through an Error: ", "test string");
  });
});
