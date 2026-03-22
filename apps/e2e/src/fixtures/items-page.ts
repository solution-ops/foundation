import { expect, type Locator, type Page } from "@playwright/test";

/**
 * API response matcher for waitForResponse assertions.
 */
export function apiResponse(urlPattern: string, method: string) {
  return (res: { url(): string; request(): { method(): string }; status(): number }) =>
    res.url().includes(urlPattern) && res.request().method() === method && res.status() < 400;
}

/**
 * Base Page Object Model for the tasks dashboard.
 *
 * Encapsulates selectors and actions shared across desktop and mobile,
 * such as creating tasks, toggling status, and asserting empty state.
 */
export class TasksPage {
  readonly heading: Locator;
  readonly emptyState: Locator;
  readonly newTaskButton: Locator;
  readonly newTaskHeading: Locator;
  readonly editTaskHeading: Locator;
  readonly deleteTaskHeading: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly prioritySelect: Locator;
  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly deleteConfirmButton: Locator;
  readonly detailsTab: Locator;
  readonly activityTab: Locator;

  constructor(protected page: Page) {
    this.heading = page.getByRole("heading", { name: "Tasks", exact: true });
    this.emptyState = page.getByText("No tasks yet");
    this.newTaskButton = page.getByRole("button", { name: /new task/i }).first();
    this.newTaskHeading = page.getByRole("heading", { name: "New task" });
    this.editTaskHeading = page.getByRole("heading", { name: "Edit task" });
    this.deleteTaskHeading = page.getByRole("heading", { name: "Move to trash" });
    this.titleInput = page.getByLabel("Title");
    this.descriptionInput = page.getByLabel("Description");
    this.prioritySelect = page.getByLabel("Priority");
    this.createButton = page.getByRole("button", { name: "Create task" });
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

  /** Open the new task dialog. */
  async openNewTaskDialog() {
    await this.newTaskButton.click();
    await expect(this.newTaskHeading).toBeVisible();
  }

  /**
   * Create a task with the given title (and optional description / priority).
   * Waits for the API response before returning.
   */
  async createTask(title: string, options?: { description?: string; priority?: string }) {
    await this.openNewTaskDialog();
    await this.titleInput.fill(title);

    if (options?.description) {
      await this.descriptionInput.fill(options.description);
    }

    if (options?.priority) {
      await this.prioritySelect.click();
      await this.page.getByRole("option", { name: options.priority }).click();
    }

    await Promise.all([this.page.waitForResponse(apiResponse("/tasks", "POST")), this.createButton.click()]);

    await expect(this.newTaskHeading).not.toBeVisible();
    await expect(this.page.getByText(title)).toBeVisible();
  }

  /** Toggle a task's done/todo status via its checkbox. */
  async toggleTaskDone(title: string) {
    const isDone = await this.page
      .getByRole("checkbox", { name: new RegExp(`mark "${title}" as todo`, "i") })
      .isVisible();

    const label = isDone ? `mark "${title}" as todo` : `mark "${title}" as done`;

    await Promise.all([
      this.page.waitForResponse(apiResponse("/tasks/", "PATCH")),
      this.page.getByRole("checkbox", { name: new RegExp(label, "i") }).click(),
    ]);
  }

  /** Fill the edit form and save. Expects the edit dialog to already be open. */
  async editTaskTitle(newTitle: string) {
    await expect(this.editTaskHeading).toBeVisible();
    await this.titleInput.fill(newTitle);

    await Promise.all([this.page.waitForResponse(apiResponse("/tasks/", "PATCH")), this.saveButton.click()]);

    await expect(this.editTaskHeading).not.toBeVisible();
    await expect(this.page.getByText(newTitle)).toBeVisible();
  }

  /** Confirm moving to trash in the delete dialog. Expects the dialog to already be open. */
  async confirmMoveToTrash() {
    await expect(this.deleteTaskHeading).toBeVisible();

    await Promise.all([this.page.waitForResponse(apiResponse("/tasks/", "DELETE")), this.deleteConfirmButton.click()]);
  }

  /** Assert a task with the given text is visible on the page. */
  async expectTaskVisible(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  /** Assert a task with the given text is NOT visible on the page. */
  async expectTaskNotVisible(text: string) {
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
 * Extends TasksPage with hover-revealed dropdown menu interactions
 * for editing and deleting tasks.
 */
export class TasksDesktopPage extends TasksPage {
  /** Open the dropdown menu for a task and click Edit. */
  async openEditDialog(title: string) {
    const row = this.page.locator(".group").filter({ hasText: title });
    await row.getByRole("button", { name: "Task actions" }).click();
    await this.page.getByRole("menuitem", { name: "Edit" }).click();
  }

  /** Open the dropdown menu for a task and click Delete, then confirm. */
  async deleteTask(title: string) {
    const row = this.page.locator(".group").filter({ hasText: title });
    await row.getByRole("button", { name: "Task actions" }).click();
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    await this.confirmMoveToTrash();
  }

  /** Open the dropdown menu for the first visible task and click Delete, then confirm. */
  async deleteFirstTask() {
    await this.page.getByRole("button", { name: "Task actions" }).click();
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    await this.confirmMoveToTrash();
  }
}

/**
 * Mobile-specific Page Object Model.
 *
 * Extends TasksPage with tap-to-expand row interactions and
 * mobile-specific layout assertions.
 */
export class TasksMobilePage extends TasksPage {
  readonly bottomTabBar: Locator;
  readonly mobileSidebar: Locator;

  constructor(page: Page) {
    super(page);
    this.bottomTabBar = page.locator("nav[aria-label='Main']");
    this.mobileSidebar = page.locator("[data-sidebar='sidebar'][data-mobile='true']");
  }

  /** Get the tappable task row locator for a given title. */
  taskRow(title: string): Locator {
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

  /** Tap a task row to expand it, revealing edit/delete actions. */
  async expandTaskRow(title: string) {
    await this.taskRow(title).click();
    await expect(this.expandedEditButton).toBeVisible();
  }

  /** Tap a task row to collapse it, hiding edit/delete actions. */
  async collapseTaskRow(title: string) {
    await this.taskRow(title).click();
    await expect(this.expandedEditButton).not.toBeVisible();
  }

  /** Tap to expand the row and open the edit dialog. */
  async openEditDialog(title: string) {
    await this.expandTaskRow(title);
    await this.expandedEditButton.click();
  }

  /** Tap to expand the row, click Delete, and confirm in the dialog. */
  async deleteTask(title: string) {
    await this.expandTaskRow(title);
    await this.expandedDeleteButton.click();
    await this.confirmMoveToTrash();
  }

  /** Assert the desktop dropdown menu is NOT rendered. */
  async expectNoDropdownMenu() {
    await expect(this.page.getByRole("button", { name: "Task actions" })).toHaveCount(0);
  }

  /** Assert the "New task" button spans near full width on mobile. */
  async expectFullWidthNewTaskButton() {
    const buttonBox = await this.newTaskButton.boundingBox();
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
