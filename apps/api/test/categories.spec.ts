import { describe, expect, it } from "vitest";
import { app } from "../src/index";
import type { ApiErrorResponse } from "../src/utils/error-handler";
import { MOCK_ENV } from "./helpers";

describe("Categories API", () => {
  describe("Authentication", () => {
    it("POST /api/categories — rejects unauthenticated requests", async () => {
      const res = await app.request(
        "/api/categories",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Work", color: "blue" }),
        },
        MOCK_ENV,
      );

      expect(res.status).toBe(401);
      const data = (await res.json()) as ApiErrorResponse;
      expect(data.message).toBe("Unauthorized");
    });

    it("GET /api/categories — rejects unauthenticated requests", async () => {
      const res = await app.request("/api/categories", {}, MOCK_ENV);

      expect(res.status).toBe(401);
    });

    it("PATCH /api/categories/reorder — rejects unauthenticated requests", async () => {
      const res = await app.request(
        "/api/categories/reorder",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: ["id-1"] }),
        },
        MOCK_ENV,
      );

      expect(res.status).toBe(401);
    });

    it("PATCH /api/categories/:id — rejects unauthenticated requests", async () => {
      const res = await app.request(
        "/api/categories/some-id",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Updated" }),
        },
        MOCK_ENV,
      );

      expect(res.status).toBe(401);
    });

    it("DELETE /api/categories/:id — rejects unauthenticated requests", async () => {
      const res = await app.request("/api/categories/some-id", { method: "DELETE" }, MOCK_ENV);

      expect(res.status).toBe(401);
    });
  });
});
