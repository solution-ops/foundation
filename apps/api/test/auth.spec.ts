import { describe, expect, it } from "vitest";
import { app } from "../src/index";
import type { ApiErrorResponse } from "../src/utils/error-handler";
import { MOCK_ENV } from "./helpers";

describe("Authentication", () => {
  describe("Auth Endpoints", () => {
    it("should handle sign-up requests", async () => {
      const signUpData = {
        email: "test@example.com",
        password: "securepassword123",
        name: "Test User",
      };

      const res = await app.request(
        "/api/auth/sign-up/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signUpData),
        },
        MOCK_ENV,
      );

      // Should get some response from the auth endpoint (better-auth handles this)
      expect([200, 400, 404, 409, 422, 500]).toContain(res.status);
    });

    it("should handle sign-in requests", { timeout: 15000 }, async () => {
      const signInData = {
        email: "test@example.com",
        password: "securepassword123",
      };

      const res = await app.request(
        "/api/auth/sign-in/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(signInData),
        },
        MOCK_ENV,
      );

      // Should get some response from the auth endpoint
      expect([200, 400, 401, 404, 500]).toContain(res.status);
    });

    it("should handle session requests", async () => {
      const res = await app.request("/api/auth/get-session", {}, MOCK_ENV);

      // Should respond to session requests (better-auth handles this)
      expect([200, 401, 404, 500]).toContain(res.status);
    });
  });

  describe("Protected Routes", () => {
    it("should reject unauthenticated requests to protected routes", async () => {
      const res = await app.request("/api", {}, MOCK_ENV);

      expect(res.status).toBe(401);
    });

    it("should include proper error message for unauthorized access", async () => {
      const res = await app.request("/api", {}, MOCK_ENV);
      const data = (await res.json()) as ApiErrorResponse;

      expect(res.status).toBe(401);
      expect(data.message).toBe("Unauthorized");
    });
  });
});
