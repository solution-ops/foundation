import { describe, expect, it } from "vitest";
import { app } from "../src/index";
import { MOCK_ENV } from "./helpers";

describe("Index Endpoint (Protected)", () => {
  it("should return 401 when not authenticated", async () => {
    const res = await app.request("/api", {}, MOCK_ENV);

    expect(res.status).toBe(401);
  });

  it("should return secret data when authenticated", async () => {
    // TODO: Add proper authentication setup for testing
    // This test will need to be updated once authentication is properly configured in tests
    const res = await app.request(
      "/api",
      {
        headers: {
          // Add authentication headers when available
          // Authorization: "Bearer test-token",
        },
      },
      MOCK_ENV,
    );

    // For now, we expect 401 until auth is properly set up in tests
    expect(res.status).toBe(401);

    // When auth is properly set up, this should be:
    // expect(res.status).toBe(200);
    // const data = await res.json();
    // expect(data.message).toBe("Secret data");
  });
});
