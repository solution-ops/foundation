import type { HealthResponse } from "@foundation/types/health";
import { describe, expect, it } from "vitest";
import { app } from "../src/index";
import { MOCK_ENV } from "./helpers";

describe("About Endpoint", () => {
  it("should respond with about information", async () => {
    const res = await app.request("/api/about", {}, MOCK_ENV);
    const data = (await res.json()) as HealthResponse;

    expect(res.status).toBe(200);
    expect(data).toMatchObject({
      status: "ok",
      message: "hello from@foundation/api about route",
      timestamp: expect.any(String),
    });
  });

  it("should have valid timestamp format", async () => {
    const res = await app.request("/api/about", {}, MOCK_ENV);
    const data = (await res.json()) as HealthResponse;

    // Verify timestamp is a valid ISO string
    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);
  });

  it("should be publicly accessible", async () => {
    // About endpoint should be publicly accessible
    const res = await app.request("/api/about", {}, MOCK_ENV);
    expect(res.status).toBe(200);
  });
});
