import { expect, type Locator, type Page } from "@playwright/test";

import { apiResponse } from "./tasks-page";

/**
 * Base Page Object Model for the trash view.
 *
 * Encapsulates selectors and actions shared across desktop and mobile,
 * such as navigating to trash, asserting empty state, and checking task visibility.
 */
export class TrashPage {
  readonly heading: Locator;
  readonly subtitle: Locator;
  readonly emptyState: Locator;
  readonly sidebarTrashLink: Locator;
  readonly sidebarTasksLink: Locator;

  constructor(protected page: Page) {
    this.heading = page.getByRole("heading", { name: "Trash", exact: true });
    this.subtitle = page.getByText("permanently removed after 30 days");
    this.emptyState = page.getByText("Trash is empty");
    this.sidebarTrashLink = page.getByRole("link", { name: "Trash" });
    this.sidebarTasksLink = page.getByRole("link", { name: "Dashboard" });
  }

  /** Assert the trash page loaded with the heading visible. */
  async expectLoaded() {
    await expect(this.heading).toBeVisible();
  }

  /** Assert the empty state message is visible. */
  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  /** Assert a task with the given title is visible in the trash list. */
  async expectTaskVisible(title: string) {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  /** Assert a task with the given title is NOT visible in the trash list. */
  async expectTaskNotVisible(title: string) {
    await expect(this.page.getByText(title, { exact: true })).not.toBeVisible();
  }

  /** Assert a task shows "Deleted today" text. */
  async expectDeletedToday(title: string) {
    const row = this.page.locator("div").filter({ hasText: title });
    await expect(row.getByText("Deleted today")).toBeVisible();
  }

  /** Navigate to the trash page via the sidebar link. */
  async navigateToTrash() {
    await Promise.all([
      this.page.waitForURL("**/trash"),
      this.page.waitForResponse(apiResponse("/tasks", "GET")),
      this.sidebarTrashLink.click(),
    ]);
    await this.expectLoaded();
  }

  /** Navigate to the dashboard via the sidebar link. */
  async navigateToDashboard() {
    await this.sidebarTasksLink.click();
    await this.page.waitForURL("**/dashboard");
    await expect(this.page.getByRole("heading", { name: "Tasks", exact: true })).toBeVisible();
  }
}

/**
 * Desktop-specific Trash Page Object Model.
 *
 * Extends TrashPage with hover-revealed dropdown menu interactions
 * for restoring tasks.
 */
export class TrashDesktopPage extends TrashPage {
  /** Restore a task via the dropdown menu. */
  async restoreTask(title: string) {
    const row = this.page.locator("div.group").filter({ hasText: title });
    await row.hover();
    await row.getByRole("button", { name: "Task actions" }).click({ force: true });
    const restoreItem = this.page.getByRole("menuitem", { name: "Restore" });
    await expect(restoreItem).toBeVisible();
    await Promise.all([this.page.waitForResponse(apiResponse("/restore", "POST")), restoreItem.click()]);
  }
}

/**
 * Mobile-specific Trash Page Object Model.
 *
 * Extends TrashPage with tap-to-expand row interactions
 * for restoring tasks.
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

  /** Restore a task by tapping the row to expand and clicking Restore. */
  async restoreTask(title: string) {
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
      this.page.waitForResponse(apiResponse("/tasks", "GET")),
      this.bottomTabBar.getByRole("link", { name: "Trash" }).click(),
    ]);
    await this.expectLoaded();
  }

  /** Navigate to the dashboard via the bottom tab bar. */
  async navigateToDashboard() {
    await this.bottomTabBar.getByRole("link", { name: "Dashboard" }).click();
    await this.page.waitForURL("**/dashboard");
    await expect(this.page.getByRole("heading", { name: "Tasks", exact: true })).toBeVisible();
  }
}
