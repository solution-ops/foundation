import type { Page } from "@playwright/test";
import { test as base } from "@playwright/test";
import { AuthPage } from "../fixtures/auth-page";
import { CategoriesDesktopPage } from "../fixtures/categories-page";
import { ItemsDesktopPage, ItemsMobilePage } from "../fixtures/items-page";
import { TrashDesktopPage, TrashMobilePage } from "../fixtures/trash-page";
import {
  cleanupSeedUser,
  cleanupUserCategories,
  cleanupUserTasks,
  createSeedUser,
  type TestUser,
} from "../utils/database";

type Fixtures = {
  testUser: TestUser;
  authPage: AuthPage;
  authenticatedPage: Page;
  itemsDesktopPage: ItemsDesktopPage;
  itemsMobilePage: ItemsMobilePage;
  trashDesktopPage: TrashDesktopPage;
  trashMobilePage: TrashMobilePage;
  categoriesDesktopPage: CategoriesDesktopPage;
};

export const test = base.extend<Fixtures>({
  /**
   * Test user fixture - creates a seed user and automatically cleans up after the test
   */

  // biome-ignore lint/correctness/noEmptyPattern: don't need to use the page here
  testUser: async ({}, use) => {
    const user = await createSeedUser();
    await use(user);
    // Do not clean up per test when using a stable seed user; cleanup happens in global teardown
    if (!process.env.SEED_USER_EMAIL) {
      await cleanupSeedUser(user.id);
    }
  },

  /**
   * Auth page fixture - provides a page object for authentication workflows
   */
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  /**
   * Authenticated page fixture - provides a pre-authenticated page
   * Combines the testUser and authPage fixtures to create a ready-to-use authenticated state
   */
  authenticatedPage: async ({ page, testUser }, use) => {
    // Clean up any leftover items and categories from previous test runs
    await cleanupUserTasks(testUser.id);
    await cleanupUserCategories(testUser.id);

    const authPage = new AuthPage(page);

    // Sign in the user using the page object
    await authPage.signIn({
      email: testUser.email,
      password: testUser.password,
    });

    // Wait for successful authentication
    await authPage.waitForAuthSuccess();

    // Provide the authenticated page for use in tests
    await use(page);
  },

  /**
   * Items desktop page fixture - provides a POM for desktop item interactions
   * Depends on authenticatedPage to ensure the user is signed in
   */
  itemsDesktopPage: async ({ authenticatedPage }, use) => {
    await use(new ItemsDesktopPage(authenticatedPage));
  },

  /**
   * Items mobile page fixture - provides a POM for mobile item interactions
   * Depends on authenticatedPage to ensure the user is signed in
   */
  itemsMobilePage: async ({ authenticatedPage }, use) => {
    await use(new ItemsMobilePage(authenticatedPage));
  },

  /**
   * Trash desktop page fixture - provides a POM for desktop trash interactions
   * Depends on authenticatedPage to ensure the user is signed in
   */
  trashDesktopPage: async ({ authenticatedPage }, use) => {
    await use(new TrashDesktopPage(authenticatedPage));
  },

  /**
   * Trash mobile page fixture - provides a POM for mobile trash interactions
   * Depends on authenticatedPage to ensure the user is signed in
   */
  trashMobilePage: async ({ authenticatedPage }, use) => {
    await use(new TrashMobilePage(authenticatedPage));
  },

  /**
   * Categories desktop page fixture - provides a POM for category interactions
   * Depends on authenticatedPage to ensure the user is signed in
   */
  categoriesDesktopPage: async ({ authenticatedPage }, use) => {
    await use(new CategoriesDesktopPage(authenticatedPage));
  },
});

export { expect } from "@playwright/test";
