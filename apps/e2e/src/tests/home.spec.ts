import { appConfig } from "@foundation/constants/app-config";
import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the homepage", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Verify the page title
    await expect(page).toHaveTitle(/Foundation/);

    // Verify main content is visible
    await expect(page.getByRole("navigation").getByText(appConfig.name)).toHaveText(appConfig.name);

    await expect(page.getByRole("heading", { name: /build faster/i })).toBeVisible();
  });

  test("should have sign-up and sign-in links", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByText("Get started").first()).toBeVisible();
  });

  test("should display feature titles", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Auth built in")).toBeVisible();
    await expect(page.getByText("Full-stack monorepo")).toBeVisible();
    await expect(page.getByText("CRUD + audit log")).toBeVisible();
    await expect(page.getByText("Dark mode + theming")).toBeVisible();
    await expect(page.getByText("Keyboard-first")).toBeVisible();
    await expect(page.getByText("Open source")).toBeVisible();
  });
});
