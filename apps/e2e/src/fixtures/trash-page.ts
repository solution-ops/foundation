import { expect, type Locator, type Page } from "@playwright/test";

import { apiResponse } from "./items-page";

/**
 * Base Page Object Model for the trash view.
 *
 * Encapsulates selectors and actions shared across desktop and mobile,
 * such as navigating to trash, asserting empty state, and checking item visibility.
 */
export class TrashPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly emptyState: Locator;
  readonly sidebarTrashLink: Locator;
  readonly sidebarDashboardLink: Locator;

  constructor(protected page: Page) {
    this.heading = page.getByRole("heading", { name: "Trash", exact: true });
    this.subtitle = page.getByText("permanently removed after 30 days");
    this.emptyState = page.getByText("Trash is empty");
    this.sidebarTrashLink = page.getByRole("link", { name: "Trash" });
    this.sidebarDashboardLink = page.getByRole("link", { name: "Dashboard" });
  }

  /** Assert the trash page loaded with the heading visible. */
  async expectLoaded() {
    await expect(this.heading).toBeVisible();
  }

  /** Assert the empty state message is visible. */
  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  /** Assert an item with the given title is visible in the trash list. */
  async expectItemVisible(title: string) {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  /** Assert an item with the given title is NOT visible in the trash list. */
  async expectItemNotVisible(title: string) {
    await expect(this.page.getByText(title, { exact: true })).not.toBeVisible();
  }

  /** Assert an item shows "Deleted today" text. */
  async expectDeletedToday(title: string) {
    const row = this.page.locator("div").filter({ hasText: title });
    await expect(row.getByText("Deleted today")).toBeVisible();
  }

  /** Navigate to the trash page via the sidebar link. */
  async navigateToTrash() {
    await Promise.all([
      this.page.waitForURL("**/trash"),
      this.page.waitForResponse(apiResponse("/items", "GET")),
      this.sidebarTrashLink.click(),
    ]);
    await this.expectLoaded();
  }

  /** Navigate to the dashboard via the sidebar link. */
  async navigateToDashboard() {
    await this.sidebarDashboardLink.click();
    await this.page.waitForURL("**/dashboard");
    await expect(this.page.getByRole("heading", { name: "Items", exact: true })).toBeVisible();
  }
}

/**
 * Desktop-specific Trash Page Object Model.
 *
 * Extends TrashPage with hover-revealed dropdown menu interactions
 * for restoring items.
 */
export class TrashDesktopPage extends TrashPage {
  /** Restore an item via the dropdown menu. */
  async restoreItem(title: string) {
    const row = this.page.locator("div.group").filter({ hasText: title });
    await row.hover();
    await row.getByRole("button", { name: "Item actions" }).click({ force: true });
    const restoreMenuItem = this.page.getByRole("menuitem", { name: "Restore" });
    await expect(restoreMenuItem).toBeVisible();
    await Promise.all([this.page.waitForResponse(apiResponse("/restore", "POST")), restoreMenuItem.click()]);
  }
}

/**
 * Mobile-specific Trash Page Object Model.
 *
 * Extends TrashPage with tap-to-expand row interactions
 * for restoring items.
 */
export class TrashMobilePage extends TrashPage {
  readonly bottomTabBar: Locator;

  constructor(page: Page) {
    super(page);
    this.bottomTabBar = page.locator("nav[aria-label='Main']");
  }

  /** Get the tappable trash row locator for a given title. */
  trashRow(title: string): Locator {
    return this.page.locator("[role='button']").filter({ hasText: title });
  }

  /** Tap a trash row to expand it, revealing the Restore button. */
  async expandTrashRow(title: string) {
    await this.trashRow(title).click();
    await expect(this.page.getByRole("button", { name: "Restore" })).toBeVisible();
  }

  /** Restore an item by tapping the row to expand and clicking Restore. */
  async restoreItem(title: string) {
    await this.expandTrashRow(title);
    await Promise.all([
      this.page.waitForResponse(apiResponse("/restore", "POST")),
      this.page.getByRole("button", { name: "Restore" }).click(),
    ]);
  }

  /** Navigate to trash via the bottom tab bar. */
  async navigateToTrash() {
    await Promise.all([
      this.page.waitForURL("**/trash"),
      this.page.waitForResponse(apiResponse("/items", "GET")),
      this.bottomTabBar.getByRole("link", { name: "Trash" }).click(),
    ]);
    await this.expectLoaded();
  }

  /** Navigate to the dashboard via the bottom tab bar. */
  async navigateToDashboard() {
    await this.bottomTabBar.getByRole("link", { name: "Dashboard" }).click();
    await this.page.waitForURL("**/dashboard");
    await expect(this.page.getByRole("heading", { name: "Items", exact: true })).toBeVisible();
  }
}
