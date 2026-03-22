import { expect, type Locator, type Page } from "@playwright/test";
import { apiResponse } from "./tasks-page";

/**
 * Page Object Model for sidebar category interactions.
 *
 * Encapsulates selectors and actions for creating categories via the
 * sidebar, filtering tasks by category, and verifying sidebar state.
 */
export class CategoriesDesktopPage {
  readonly categoriesLabel: Locator;
  readonly addCategoryButton: Locator;
  readonly addCategoryEmptyButton: Locator;
  readonly dialogTitle: Locator;
  readonly nameInput: Locator;
  readonly colorSelect: Locator;
  readonly createButton: Locator;
  readonly deleteCategoryTitle: Locator;
  readonly deleteCategoryConfirmButton: Locator;
  readonly deleteCategoryCancelButton: Locator;

  constructor(protected page: Page) {
    this.categoriesLabel = page.getByRole("button", { name: "Categories" });
    this.addCategoryButton = page.getByRole("button", { name: "Add category", exact: true });
    this.addCategoryEmptyButton = page.getByRole("button", { name: "Add a category" });
    this.dialogTitle = page.getByRole("heading", { name: "Add category" });
    this.nameInput = page.getByLabel("Name");
    this.colorSelect = page.getByLabel("Color");
    this.createButton = page.getByRole("button", { name: "Create" });
    this.deleteCategoryTitle = page.getByRole("heading", { name: "Delete category" });
    this.deleteCategoryConfirmButton = page.getByRole("button", { name: "Delete", exact: true });
    this.deleteCategoryCancelButton = page.getByRole("button", { name: "Cancel" });
  }

  /** Assert the sidebar categories group is visible. */
  async expectLoaded() {
    await expect(this.categoriesLabel).toBeVisible();
  }

  /** Assert the empty state "Add a category" button is visible. */
  async expectEmptyState() {
    await expect(this.addCategoryEmptyButton).toBeVisible();
  }

  /** Assert a category with the given name appears in the sidebar. */
  async expectCategoryVisible(name: string) {
    await expect(this.page.getByRole("link", { name })).toBeVisible();
  }

  /** Assert a category with the given name does NOT appear in the sidebar. */
  async expectCategoryNotVisible(name: string) {
    await expect(this.page.getByRole("link", { name, exact: true })).not.toBeVisible();
  }

  /** Assert a task count badge is visible for a given category. */
  async expectCategoryBadge(name: string, count: number) {
    const menuItem = this.page.locator("[data-slot='sidebar-menu-item']").filter({ hasText: name });
    await expect(menuItem.getByText(String(count))).toBeVisible();
  }

  /** Open the "Add category" dialog via the sidebar + button. */
  async openCreateDialog() {
    await this.addCategoryButton.click();
    await expect(this.dialogTitle).toBeVisible();
  }

  /** Open the "Add category" dialog via the empty state button. */
  async openCreateDialogFromEmptyState() {
    await this.addCategoryEmptyButton.click();
    await expect(this.dialogTitle).toBeVisible();
  }

  /**
   * Create a category with the given name and optional color.
   * Waits for the API response before returning.
   */
  async createCategory(name: string, options?: { color?: string }) {
    await this.openCreateDialog();
    await this.nameInput.fill(name);

    if (options?.color) {
      await this.colorSelect.click();
      await this.page.getByRole("option", { name: options.color }).click();
    }

    await Promise.all([this.page.waitForResponse(apiResponse("/categories", "POST")), this.createButton.click()]);

    await expect(this.dialogTitle).not.toBeVisible();
  }

  /** Click a category in the sidebar to filter tasks. Waits for navigation. */
  async clickCategory(name: string) {
    const link = this.page.getByRole("link", { name });
    await Promise.all([this.page.waitForResponse(apiResponse("/tasks", "GET")), link.click()]);
  }

  /** Assert the URL contains the expected category search param. */
  async expectUrlContainsCategory() {
    await expect(this.page).toHaveURL(/[?&]category=/);
  }

  /** Assert the URL does NOT contain a category search param. */
  async expectUrlWithoutCategory() {
    await expect(this.page).not.toHaveURL(/[?&]category=/);
  }

  /** Collapse the categories group by clicking the label. */
  async collapseCategories() {
    await this.categoriesLabel.click();
  }

  /** Expand the categories group by clicking the label. */
  async expandCategories() {
    await this.categoriesLabel.click();
  }

  // --- Category management actions ---

  /** Get the sidebar menu item locator for a given category name. */
  private categoryMenuItem(name: string) {
    return this.page.locator("[data-slot='sidebar-menu-item']").filter({ hasText: name });
  }

  /** Open the kebab (⋯) context menu for a category. */
  async openCategoryMenu(name: string) {
    const menuItem = this.categoryMenuItem(name);
    await menuItem.hover();
    await menuItem.getByRole("button", { name: "Category actions" }).click();
    await expect(this.page.getByRole("menuitem", { name: "Rename" })).toBeVisible();
  }

  /**
   * Rename a category inline. Opens menu, clicks Rename, types new name, presses Enter.
   * Waits for the API PATCH response.
   */
  async renameCategory(oldName: string, newName: string) {
    await this.openCategoryMenu(oldName);
    await this.page.getByRole("menuitem", { name: "Rename" }).click();

    // After clicking Rename, the category text is replaced by an <input>.
    // Playwright's hasText doesn't match input values, so locate generically.
    const input = this.page.locator("[data-slot='sidebar-menu-item'] input");
    await expect(input).toBeVisible();
    await input.fill(newName);

    await Promise.all([this.page.waitForResponse(apiResponse("/categories/", "PATCH")), input.press("Enter")]);
  }

  /**
   * Change a category's color via the context menu submenu.
   * Waits for the API PATCH response.
   */
  async changeCategoryColor(name: string, color: string) {
    await this.openCategoryMenu(name);
    await this.page.getByRole("menuitem", { name: "Change color" }).hover();
    // Wait for submenu to appear
    const swatch = this.page.getByRole("button", { name: color.toLowerCase() });
    await expect(swatch).toBeVisible();

    await Promise.all([this.page.waitForResponse(apiResponse("/categories/", "PATCH")), swatch.click()]);
  }

  /**
   * Delete a category via the context menu. Opens menu, clicks Delete,
   * confirms in the dialog. Waits for the API DELETE response.
   */
  async deleteCategory(name: string) {
    await this.openCategoryMenu(name);
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(this.deleteCategoryTitle).toBeVisible();

    await Promise.all([
      this.page.waitForResponse(apiResponse("/categories/", "DELETE")),
      this.deleteCategoryConfirmButton.click(),
    ]);

    await expect(this.deleteCategoryTitle).not.toBeVisible();
  }

  /** Open the delete dialog for a category, then cancel. */
  async cancelDeleteCategory(name: string) {
    await this.openCategoryMenu(name);
    await this.page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(this.deleteCategoryTitle).toBeVisible();
    await this.deleteCategoryCancelButton.click();
    await expect(this.deleteCategoryTitle).not.toBeVisible();
  }
}
