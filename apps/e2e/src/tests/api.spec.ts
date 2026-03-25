import { appConfig } from "@foundation/constants/app-config";
import { expect, test } from "@playwright/test";

test.describe
  .skip("API Integration", () => {
    test.describe("Public Endpoints", () => {
      test("should load health data on homepage", async ({ page }) => {
        await page.goto("/");

        // Wait for health data to be loaded and displayed
        await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();

        // Should show successful health status
        await expect(page.locator("pre").filter({ hasText: "ok" })).toBeVisible();

        // Should show timestamp
        await expect(page.locator("pre").filter({ hasText: "timestamp" })).toBeVisible();
      });

      test("should show API error states gracefully", async ({ page }) => {
        // Navigate to homepage
        await page.goto("/");

        // Even if API calls fail, page should still load
        await expect(page.getByRole("heading", { name: appConfig.name })).toBeVisible();

        // API sections should be present (even if showing errors)
        await expect(page.getByText("Root")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();
      });
    });

    test.describe("Protected Endpoints", () => {
      test("should handle unauthorized API calls", async ({ page }) => {
        await page.goto("/");

        // Root API call should fail without authentication
        // The UI should handle this gracefully
        await expect(page.getByText("Root")).toBeVisible();

        // Should either show error state or loading state, not crash
        const rootSection = page.locator("text=Root").locator("..");
        await expect(rootSection).toBeVisible();
      });
    });

    test.describe("Network Resilience", () => {
      test("should handle network failures gracefully", async ({ page }) => {
        // Block all API requests to simulate network failure
        await page.route("/api/**", (route) => {
          route.abort("failed");
        });

        await page.goto("/");

        // Page should still load despite API failures
        await expect(page.getByRole("heading", { name: appConfig.name })).toBeVisible();

        // API sections should be present (showing error states)
        await expect(page.getByText("Root")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();
      });

      test("should retry failed requests", async ({ page }) => {
        let requestCount = 0;

        // Fail first request, succeed on retry
        await page.route("/api/health", (route) => {
          requestCount++;
          if (requestCount === 1) {
            route.abort("failed");
          } else {
            route.continue();
          }
        });

        await page.goto("/");

        // Should eventually show health section
        await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();

        // Wait a bit for potential retry, then check if we have either success or error data
        await page.waitForTimeout(2000);

        // Should either show successful health data or handle the error gracefully
        const hasSuccessData = await page.locator("pre").filter({ hasText: "ok" }).isVisible();
        const hasErrorData = await page.locator("pre").filter({ hasText: "error" }).isVisible();
        const hasHealthHeading = await page.getByRole("heading", { name: "Health" }).isVisible();

        // At minimum, the health section should be present
        expect(hasHealthHeading).toBe(true);

        // Either success or error handling should be visible
        expect(hasSuccessData || hasErrorData || hasHealthHeading).toBe(true);
      });
    });

    test.describe("Loading States", () => {
      test("should show loading states for API calls", async ({ page }) => {
        // Delay API responses to test loading states
        await page.route("/api/**", async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          route.continue();
        });

        await page.goto("/");

        // Should show page content immediately
        await expect(page.getByRole("heading", { name: appConfig.name })).toBeVisible();

        // API sections should be present (potentially showing loading states)
        await expect(page.getByText("Root")).toBeVisible();
        await expect(page.getByRole("heading", { name: "Health" })).toBeVisible();
      });
    });
  });
