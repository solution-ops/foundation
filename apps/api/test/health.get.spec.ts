import type { HealthResponse } from "@foundation/types/health";
import { describe, expect, it } from "vitest";
import { app } from "../src/index";
import { MOCK_ENV } from "./helpers";

describe("Health Endpoint", () => {
  it("should respond with health status", async () => {
    const res = await app.request("/api/health", {}, MOCK_ENV);
    const data = (await res.json()) as HealthResponse;

    expect(res.status).toBe(200);
    expect(data).toMatchObject({
      status: "ok",
      message: "hello from@foundation/api health route",
      timestamp: expect.any(String),
    });
  });

  it("should have valid timestamp format", async () => {
    const res = await app.request("/api/health", {}, MOCK_ENV);
    const data = (await res.json()) as HealthResponse;

    // Verify timestamp is a valid ISO string
    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);

    // Verify timestamp is recent (within last 5 seconds)
    const now = new Date();
    const timeDiff = now.getTime() - timestamp.getTime();
    expect(timeDiff).toBeLessThan(5000);
  });

  it("should be accessible without authentication", async () => {
    // Health endpoint should be publicly accessible
    const res = await app.request("/api/health", {}, MOCK_ENV);
    expect(res.status).toBe(200);
  });
});
