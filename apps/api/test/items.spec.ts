import { describe, expect, it } from "vitest";
import { app } from "../src/index";
import type { ApiErrorResponse } from "../src/utils/error-handler";
import { MOCK_ENV } from "./helpers";

describe("Items API", () => {
  describe("Authentication", () => {
    it("POST /api/items — rejects unauthenticated requests", async () => {
      const res = await app.request(
        "/api/items",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Test item" }),
        },
        MOCK_ENV,
      );

      expect(res.status).toBe(401);
      const data = (await res.json()) as ApiErrorResponse;
      expect(data.message).toBe("Unauthorized");
    });

    it("GET /api/items — rejects unauthenticated requests", async () => {
      const res = await app.request("/api/items", {}, MOCK_ENV);

      expect(res.status).toBe(401);
    });

    it("GET /api/items/:id — rejects unauthenticated requests", async () => {
      const res = await app.request("/api/items/some-id", {}, MOCK_ENV);

      expect(res.status).toBe(401);
    });

    it("PATCH /api/items/:id — rejects unauthenticated requests", async () => {
      const res = await app.request(
        "/api/items/some-id",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Updated" }),
        },
        MOCK_ENV,
      );

      expect(res.status).toBe(401);
    });

    it("DELETE /api/items/:id — rejects unauthenticated requests", async () => {
      const res = await app.request("/api/items/some-id", { method: "DELETE" }, MOCK_ENV);

      expect(res.status).toBe(401);
    });
  });
});
