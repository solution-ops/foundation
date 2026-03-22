import { expect, test } from "../config/setup";
import { apiResponse } from "../fixtures/tasks-page";

test("user can create categories and filter tasks by category", async ({
  authenticatedPage: page,
  categoriesDesktopPage: categories,
  tasksDesktopPage: tasks,
}) => {
  // User lands on the dashboard and sees the sidebar categories group
  await tasks.expectLoaded();
  await categories.expectLoaded();

  // Sidebar shows the empty state for categories
  await categories.expectEmptyState();

  // User creates their first category via the sidebar + button
  await categories.createCategory("Work", { color: "Blue" });
  await categories.expectCategoryVisible("Work");

  // User creates a second category
  await categories.createCategory("Personal", { color: "Green" });
  await categories.expectCategoryVisible("Personal");

  // Empty state is no longer shown
  await expect(categories.addCategoryEmptyButton).not.toBeVisible();

  // User creates a task assigned to the "Work" category
  await tasks.openNewTaskDialog();
  await tasks.titleInput.fill("Finish report");
  await page.getByRole("combobox", { name: "Category" }).click();
  await page.getByRole("option", { name: "Work" }).click();
  await Promise.all([page.waitForResponse(apiResponse("/tasks", "POST")), tasks.createButton.click()]);
  await tasks.expectTaskVisible("Finish report");

  // The Work category now shows a badge with count 1
  await categories.expectCategoryBadge("Work", 1);

  // User clicks the Work category to filter tasks
  await categories.clickCategory("Work");
  await categories.expectUrlContainsCategory();
  await tasks.expectTaskVisible("Finish report");

  // User clicks the Personal category — no tasks should appear
  await categories.clickCategory("Personal");
  await categories.expectUrlContainsCategory();
  await tasks.expectTaskNotVisible("Finish report");

  // User collapses the categories group
  await categories.collapseCategories();
  await categories.expectCategoryNotVisible("Work");
  await categories.expectCategoryNotVisible("Personal");

  // User expands the categories group again
  await categories.expandCategories();
  await categories.expectCategoryVisible("Work");
  await categories.expectCategoryVisible("Personal");
});

test("user can rename a category inline", async ({ categoriesDesktopPage: categories, tasksDesktopPage: tasks }) => {
  await tasks.expectLoaded();
  await categories.expectLoaded();

  // Create a category to rename
  await categories.createCategory("Old Name", { color: "Red" });
  await categories.expectCategoryVisible("Old Name");

  // Rename the category via the context menu
  await categories.renameCategory("Old Name", "New Name");

  // The old name should be gone and the new name visible
  await categories.expectCategoryNotVisible("Old Name");
  await categories.expectCategoryVisible("New Name");
});

test("user can change a category color", async ({ categoriesDesktopPage: categories, tasksDesktopPage: tasks }) => {
  await tasks.expectLoaded();
  await categories.expectLoaded();

  // Create a category with blue color
  await categories.createCategory("Design", { color: "Blue" });
  await categories.expectCategoryVisible("Design");

  // Change the color to red via submenu
  await categories.changeCategoryColor("Design", "red");

  // Category should still be visible (color changed server-side)
  await categories.expectCategoryVisible("Design");
});

test("user can delete a category with confirmation", async ({
  categoriesDesktopPage: categories,
  tasksDesktopPage: tasks,
}) => {
  await tasks.expectLoaded();
  await categories.expectLoaded();

  // Create a category to delete
  await categories.createCategory("Temporary", { color: "Orange" });
  await categories.expectCategoryVisible("Temporary");

  // Delete the category via context menu + confirmation dialog
  await categories.deleteCategory("Temporary");

  // The category should no longer be visible
  await categories.expectCategoryNotVisible("Temporary");
});

test("user can cancel category deletion", async ({ categoriesDesktopPage: categories, tasksDesktopPage: tasks }) => {
  await tasks.expectLoaded();
  await categories.expectLoaded();

  // Create a category
  await categories.createCategory("Keep Me", { color: "Green" });
  await categories.expectCategoryVisible("Keep Me");

  // Open delete dialog but cancel
  await categories.cancelDeleteCategory("Keep Me");

  // The category should still be visible
  await categories.expectCategoryVisible("Keep Me");
});
