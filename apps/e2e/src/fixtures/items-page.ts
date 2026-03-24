import { expect, type Locator, type Page } from "@playwright/test";

/**
 * API response matcher for waitForResponse assertions.
 */
export function apiResponse(urlPattern: string, method: string) {
  return (res: { url(): string; request(): { method(): string }; status(): number }) =>
    res.url().includes(urlPattern) && res.request().method() === method && res.status() < 400;
}

/**
 * Base Page Object Model for the items dashboard.
 *
 * Encapsulates selectors and actions shared across desktop and mobile,
 * such as creating items, toggling status, and asserting empty state.
 */
export class ItemsPage {
  readonly heading: Locator;
  readonly emptyState: Locator;
  readonly newItemButton: Locator;
  readonly newItemHeading: Locator;
  readonly editItemHeading: Locator;
  readonly deleteItemHeading: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly prioritySelect: Locator;
  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly deleteConfirmButton: Locator;
  readonly detailsTab: Locator;
  readonly activityTab: Locator;

  constructor(protected page: Page) {
    this.heading = page.getByRole("heading", { name: "Items", exact: true });
    this.emptyState = page.getByText("No items yet");
    this.newItemButton = page.getByRole("button", { name: /new item/i }).first();
    this.newItemHeading = page.getByRole("heading", { name: "New item" });
    this.editItemHeading = page.getByRole("heading", { name: "Edit item" });
    this.deleteItemHeading = page.getByRole("heading", { name: "Move to trash" });
    this.titleInput = page.getByLabel("Title");
    this.descriptionInput = page.getByLabel("Description");
    this.prioritySelect = page.getByLabel("Priority");
    this.createButton = page.getByRole("button", { name: "Create item" });
    this.saveButton = page.getByRole("button", { name: "Save changes" });
    this.deleteConfirmButton = page.getByRole("button", { name: "Move to trash" });
    this.detailsTab = page.getByRole("tab", { name: "Details" });
    this.activityTab = page.getByRole("tab", { name: "Activity" });
  }

  /** Assert the dashboard loaded with the heading visible. */
  async expectLoaded() {
    await expect(this.heading).toBeVisible();
  }

  /** Assert the empty state message is visible. */
  async expectEmptyState() {
    await expect(this.emptyState).toBeVisible();
  }

  /** Open the new item dialog. */
  async openNewItemDialog() {
    await this.newItemButton.click();
    await expect(this.newItemHeading).toBeVisible();
  }

  /**
   * Create an item with the given title (and optional description / priority).
   * Waits for the API response before returning.
   */
  async createItem(title: string, options?: { description?: string; priority?: string }) {
    await this.openNewItemDialog();
    await this.titleInput.fill(title);

    if (options?.description) {
      await this.descriptionInput.fill(options.description);
    }

    if (options?.priority) {
      await this.prioritySelect.click();
      await this.page.getByRole("option", { name: options.priority }).click();
    }

    await Promise.all([this.page.waitForResponse(apiResponse("/items", "POST")), this.createButton.click()]);

    await expect(this.newItemHeading).not.toBeVisible();
    await expect(this.page.getByText(title)).toBeVisible();
  }

  /** Toggle an item's done/todo status via its checkbox. */
  async toggleItemDone(title: string) {
    const isDone = await this.page
      .getByRole("checkbox", { name: new RegExp(`mark "${title}" as todo`, "i") })
      .isVisible();

    const label = isDone ? `mark "${title}" as todo` : `mark "${title}" as done`;

    await Promise.all([
      this.page.waitForResponse(apiResponse("/items/", "PATCH")),
      this.page.getByRole("checkbox", { name: new RegExp(label, "i") }).click(),
    ]);
  }

  /** Fill the edit form and save. Expects the edit dialog to already be open. */
  async editItemTitle(newTitle: string) {
    await expect(this.editItemHeading).toBeVisible();
    await this.titleInput.fill(newTitle);

    await Promise.all([this.page.waitForResponse(apiResponse("/items/", "PATCH")), this.saveButton.click()]);

    await expect(this.editItemHeading).not.toBeVisible();
    await expect(this.page.getByText(newTitle)).toBeVisible();
  }

  /** Confirm moving to trash in the delete dialog. Expects the dialog to already be open. */
  async confirmMoveToTrash() {
    await expect(this.deleteItemHeading).toBeVisible();

    await Promise.all([this.page.waitForResponse(apiResponse("/items/", "DELETE")), this.deleteConfirmButton.click()]);
  }

  /** Assert an item with the given text is visible on the page. */
  async expectItemVisible(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /** Assert an item with the given text is NOT visible on the page. */
  async expectItemNotVisible(text: string) {
    await expect(this.page.getByText(text, { exact: true })).not.toBeVisible();
  }

  /** Switch to the Activity tab in the edit dialog. Waits for activity API response. */
  async switchToActivityTab() {
    await Promise.all([this.page.waitForResponse(apiResponse("/activity", "GET")), this.activityTab.click()]);
  }

  /** Switch to the Details tab in the edit dialog. */
  async switchToDetailsTab() {
    await this.detailsTab.click();
  }

  /** Assert an activity entry with the given action label is visible (e.g. "Created", "Updated"). */
  async expectActivityEntry(label: string) {
    await expect(this.page.getByText(label, { exact: true }).first()).toBeVisible();
  }

  /** Assert a field-level change diff is visible (e.g. field label "Title:"). */
  async expectActivityFieldChange(fieldLabel: string) {
    await expect(this.page.getByText(`${fieldLabel}:`).first()).toBeVisible();
  }
}

/**
 * Desktop-specific Page Object Model.
 *
 * Extends ItemsPage with hover-revealed dropdown menu interactions
 * for editing and deleting items.
 */
export class ItemsDesktopPage extends ItemsPage {
  /** Open the dropdown menu for an item and click Edit. */
  async openEditDialog(title: string) {
    const row = this.page.locator(".group").filter({ hasText: title });
    await row.getByRole("button", { name: "Item actions" }).click();
    await this.page.getByRole("menuitem", { name: "Edit" }).click();
  }

  /** Open the dropdown menu for an item and click Delete, then confirm. */
  async deleteItem(title: string) {
    const row = this.page.locator(".group").filter({ hasText: title });
    await row.getByRole("button", { name: "Item actions" }).click();
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    await this.confirmMoveToTrash();
  }

  /** Open the dropdown menu for the first visible item and click Delete, then confirm. */
  async deleteFirstItem() {
    await this.page.getByRole("button", { name: "Item actions" }).click();
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    await this.confirmMoveToTrash();
  }
}

/**
 * Mobile-specific Page Object Model.
 *
 * Extends ItemsPage with tap-to-expand row interactions and
 * mobile-specific layout assertions.
 */
export class ItemsMobilePage extends ItemsPage {
  readonly bottomTabBar: Locator;
  readonly mobileSidebar: Locator;

  constructor(page: Page) {
    super(page);
    this.bottomTabBar = page.locator("nav[aria-label='Main']");
    this.mobileSidebar = page.locator("[data-sidebar='sidebar'][data-mobile='true']");
  }

  /** Get the tappable item row locator for a given title. */
  itemRow(title: string): Locator {
    return this.page.locator("[role='button']").filter({ hasText: title });
  }

  /** The Edit button shown in the expanded row action area. */
  get expandedEditButton(): Locator {
    return this.page.getByRole("button", { name: "Edit" });
  }

  /** The Delete button shown in the expanded row action area. */
  get expandedDeleteButton(): Locator {
    return this.page.getByRole("button", { name: /^Delete$/ });
  }

  /** Tap an item row to expand it, revealing edit/delete actions. */
  async expandItemRow(title: string) {
    await this.itemRow(title).click();
    await expect(this.expandedEditButton).toBeVisible();
  }

  /** Tap an item row to collapse it, hiding edit/delete actions. */
  async collapseItemRow(title: string) {
    await this.itemRow(title).click();
    await expect(this.expandedEditButton).not.toBeVisible();
  }

  /** Tap to expand the row and open the edit dialog. */
  async openEditDialog(title: string) {
    await this.expandItemRow(title);
    await this.expandedEditButton.click();
  }

  /** Tap to expand the row, click Delete, and confirm in the dialog. */
  async deleteItem(title: string) {
    await this.expandItemRow(title);
    await this.expandedDeleteButton.click();
    await this.confirmMoveToTrash();
  }

  /** Assert the desktop dropdown menu is NOT rendered. */
  async expectNoDropdownMenu() {
    await expect(this.page.getByRole("button", { name: "Item actions" })).toHaveCount(0);
  }

  /** Assert the "New item" button spans near full width on mobile. */
  async expectFullWidthNewItemButton() {
    const buttonBox = await this.newItemButton.boundingBox();
    const viewportSize = this.page.viewportSize();

    if (!buttonBox || !viewportSize) {
      throw new Error("Could not measure button or viewport dimensions");
    }

    // On mobile (390px viewport), the button should be near full-width
    // The main content has p-4 (16px) padding on each side
    const widthRatio = buttonBox.width / viewportSize.width;
    expect(widthRatio).toBeGreaterThan(0.7);
  }

  /** Navigate to a page via the bottom tab bar. */
  async navigateViaTab(name: string) {
    await this.bottomTabBar.getByRole("link", { name }).click();
  }
}
