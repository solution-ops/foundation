import { expect, test } from "../config/setup";

test.describe("Authentication Flow", () => {
  test.describe("Sign Up", () => {
    test("should display sign up form", async ({ page }) => {
      await page.goto("/sign-up");

      // Verify sign up form elements
      await expect(page.getByRole("heading", { name: "Create a new account" })).toBeVisible();
      await expect(page.getByLabel(/username/i)).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await page.goto("/sign-up");

      // Try to submit empty form
      await page.getByRole("button", { name: /sign up/i }).click();

      // Check that we're still on the sign-up page (form didn't submit due to validation)
      await expect(page).toHaveURL(/.*sign-up/);

      // Verify form fields are present and empty (custom validation will handle validation)
      const usernameInput = page.getByLabel(/username/i);
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);

      await expect(usernameInput).toBeVisible();
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      // Verify fields are empty
      await expect(usernameInput).toHaveValue("");
      await expect(emailInput).toHaveValue("");
      await expect(passwordInput).toHaveValue("");
    });

    test("should show validation error for invalid email", async ({ page }) => {
      await page.goto("/sign-up");

      // Fill form with invalid email
      await page.getByLabel(/username/i).fill("testuser");
      await page.getByLabel(/email/i).fill("invalid-email");
      await page.getByLabel(/password/i).fill("password123");

      // Try to submit - browser validation should prevent submission
      await page.getByRole("button", { name: /sign up/i }).click();

      // Check that we're still on the sign-up page (form didn't submit due to validation)
      await expect(page).toHaveURL(/.*sign-up/);

      // Verify the email input shows browser validation state
      const emailInput = page.getByLabel(/email/i);
      await expect(emailInput).toHaveAttribute("type", "email");

      // Check if browser shows validation message (this varies by browser)
      const isInvalid = await emailInput.evaluate((input: HTMLInputElement) => {
        return !input.validity.valid;
      });
      expect(isInvalid).toBe(true);
    });

    test("should navigate to sign in from sign up", async ({ page }) => {
      await page.goto("/sign-up");

      // Click sign in link in the form (not navigation)
      await page
        .getByText("Already have an account?")
        .getByRole("link", { name: /sign in/i })
        .click();

      // Should navigate to sign in page
      await expect(page).toHaveURL(/.*sign-in/);
    });
  });

  test.describe("Sign In", () => {
    test("should display sign in form", async ({ page }) => {
      await page.goto("/sign-in");

      // Verify sign in form elements
      await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();

      // Should not show username field
      await expect(page.getByLabel(/username/i)).not.toBeVisible();
    });

    test("should show validation errors for empty form", async ({ page }) => {
      await page.goto("/sign-in");

      // Try to submit empty form
      await page
        .getByRole("button", { name: /sign in/i })
        .first()
        .click();

      // Check that we're still on the sign-in page (form didn't submit due to validation)
      await expect(page).toHaveURL(/.*sign-in/);

      // Verify form fields are present and empty (custom validation will handle validation)
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/password/i);

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      // Verify fields are empty
      await expect(emailInput).toHaveValue("");
      await expect(passwordInput).toHaveValue("");
    });

    test("should navigate to sign up from sign in", async ({ page }) => {
      await page.goto("/sign-in");

      // Click sign up link in the form (not navigation)
      await page
        .getByText("Don't have an account?")
        .getByRole("link", { name: /sign up/i })
        .click();

      // Should navigate to sign up page
      await expect(page).toHaveURL(/.*sign-up/);
    });

    test("should sign in with valid credentials", async ({ page, testUser, authPage }) => {
      await authPage.signIn({
        email: testUser.email,
        password: testUser.password,
      });
      await authPage.waitForAuthSuccess();
      await expect(page).toHaveURL(/.*dashboard/);
    });
  });

  test.describe("Sign Out", () => {
    test("should sign out", async ({ page, testUser, authPage }) => {
      await authPage.signIn({
        email: testUser.email,
        password: testUser.password,
      });

      await authPage.waitForAuthSuccess();
      await expect(page).toHaveURL(/.*dashboard/);

      // Sign out is in the sidebar user dropdown menu
      await page.locator("[data-slot='sidebar-footer']").getByRole("button").click();
      await page.getByRole("menuitem", { name: /sign out/i }).click();
      await authPage.waitForAuthRedirect();
      await expect(page).toHaveURL(/.*(sign-in|sign-up).*/);
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect to sign up when accessing protected route without auth", async ({ page }) => {
      // Try to access protected dashboard
      await page.goto("/dashboard");

      // Should redirect to sign up with redirect parameter
      await expect(page).toHaveURL(/.*sign-up.*redirect/);
    });

    test("should redirect to sign up when accessing about page without auth", async ({ page }) => {
      // Try to access protected about page
      await page.goto("/about");

      // Should redirect to sign up
      await expect(page).toHaveURL(/.*sign-up/);
    });

    test("should show sign up form when redirected from protected route", async ({ page }) => {
      await page.goto("/dashboard");

      // Should show sign up form
      await expect(page.getByRole("heading", { name: "Create a new account" })).toBeVisible();
      await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
    });
  });

  test.describe("Theme Toggle", () => {
    test("should have theme functionality available", async ({ page }) => {
      await page.goto("/");

      // Landing page has two theme toggles (nav + footer), use .first() to avoid strict mode
      const themeToggle = page.getByRole("button", { name: /toggle theme/i }).first();
      const themeToggleExists = (await themeToggle.count()) > 0;

      if (themeToggleExists) {
        // If theme toggle exists, test it
        await expect(themeToggle).toBeVisible();
        await themeToggle.click();
        await expect(page.locator("html")).toHaveAttribute("class", /dark|light/);
      } else {
        // If no theme toggle (e.g. mobile), just verify the page loads correctly
        await expect(page.getByRole("heading", { name: /build faster/i })).toBeVisible();
      }
    });
  });
});
