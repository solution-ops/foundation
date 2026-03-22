import { expect, test } from "@playwright/test";
import { appConfig } from "@foundation/constants/app-config";

test.describe("Home Page", () => {
  test("should load the homepage", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Verify the page title
    await expect(page).toHaveTitle(/Foundation/);

    // Verify main content is visible
    await expect(page.getByRole("navigation").getByText(appConfig.name)).toHaveText(appConfig.name);

    await expect(page.getByRole("heading", { name: /get things done/i })).toBeVisible();
  });

  test("should have sign-up and sign-in links", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByText("Start free").first()).toBeVisible();
  });
});
