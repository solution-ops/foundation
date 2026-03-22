import type { Page } from "@playwright/test";

/**
 * Page Object Model for authentication workflows
 * Handles sign-up and sign-in form interactions
 */
export class AuthPage {
  constructor(private page: Page) {}

  /**
   * Navigate to the sign-up page
   */
  async goToSignUp() {
    await this.page.goto("/sign-up");
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Navigate to the sign-in page
   */
  async goToSignIn() {
    await this.page.goto("/sign-in");
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Fill out the sign-up form
   */
  async fillSignUpForm(userData: { name: string; email: string; password: string }) {
    await this.page.getByLabel(/username/i).fill(userData.name);
    await this.page.getByLabel(/email/i).fill(userData.email);
    await this.page.getByLabel(/password/i).fill(userData.password);
  }

  /**
   * Fill out the sign-in form
   */
  async fillSignInForm(userData: { email: string; password: string }) {
    await this.page.getByLabel(/email/i).fill(userData.email);
    await this.page.getByLabel(/password/i).fill(userData.password);
  }

  /**
   * Submit the sign-up form
   */
  async submitSignUp() {
    await this.page.getByRole("button", { name: /sign up/i }).click();
  }

  /**
   * Submit the sign-in form
   */
  async submitSignIn() {
    await this.page
      .getByRole("button", { name: /sign in/i })
      .first()
      .click();
  }

  /**
   * Complete sign-up workflow
   */
  async signUp(userData: { name: string; email: string; password: string }) {
    await this.goToSignUp();
    await this.fillSignUpForm(userData);
    await this.submitSignUp();
  }

  /**
   * Complete sign-in workflow
   */
  async signIn(userData: { email: string; password: string }) {
    await this.goToSignIn();
    await this.fillSignInForm(userData);
    await this.submitSignIn();
  }

  /**
   * Wait for successful authentication redirect
   * @param timeout - Timeout in milliseconds (default: 10000)
   */
  async waitForAuthSuccess(timeout = 10000) {
    await this.page.waitForURL(/\/(dashboard|about)/, { timeout });
  }

  /**
   * Wait for redirect to sign-up page (when authentication fails or user not authenticated)
   * @param timeout - Timeout in milliseconds (default: 10000)
   */
  async waitForAuthRedirect(timeout = 10000) {
    await this.page.waitForURL(/.*(sign-in|sign-up).*/, { timeout });
  }

  /**
   * Check if currently on sign-up page
   */
  async isOnSignUp() {
    return this.page.url().includes("/sign-up");
  }

  /**
   * Check if currently on sign-in page
   */
  async isOnSignIn() {
    return this.page.url().includes("/sign-in");
  }

  /**
   * Get form validation errors (if any)
   */
  async getValidationErrors() {
    const errors = await this.page.locator("[data-testid*='error'], .error, [role='alert']").allTextContents();
    return errors.filter((error) => error.trim().length > 0);
  }

  /**
   * Click the link to switch from sign-up to sign-in
   */
  async switchToSignIn() {
    await this.page
      .getByText("Already have an account?")
      .getByRole("link", { name: /sign in/i })
      .click();
  }

  /**
   * Click the link to switch from sign-in to sign-up
   */
  async switchToSignUp() {
    await this.page
      .getByText("Don't have an account?")
      .getByRole("link", { name: /sign up/i })
      .click();
  }
}
