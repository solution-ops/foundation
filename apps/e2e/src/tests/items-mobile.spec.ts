import { expect, test } from "../config/setup";

test.describe("mobile: task row tap-to-expand", () => {
  test("tapping a task row reveals edit and delete actions", async ({ tasksMobilePage: tasks }) => {
    await tasks.createTask("Tap test task");

    // Desktop dropdown menu should NOT be rendered on mobile
    await tasks.expectNoDropdownMenu();

    // Task row should be tappable (role="button")
    await expect(tasks.taskRow("Tap test task")).toBeVisible();

    // Tap to expand — edit and delete buttons appear
    await tasks.expandTaskRow("Tap test task");
    await expect(tasks.expandedDeleteButton).toBeVisible();

    // Tap again to collapse — buttons disappear
    await tasks.collapseTaskRow("Tap test task");
    await expect(tasks.expandedDeleteButton).not.toBeVisible();

    // Clean up
    await tasks.deleteTask("Tap test task");
    await tasks.expectEmptyState();
  });
});

test.describe("mobile: full crud flow", () => {
  test("user can create, edit, and delete tasks on mobile", async ({ tasksMobilePage: tasks }) => {
    // Empty state
    await tasks.expectLoaded();
    await tasks.expectEmptyState();

    // Create a task
    await tasks.createTask("Mobile task");
    await tasks.expectTaskVisible("Todo");

    // Toggle done via checkbox (same UX on mobile)
    await tasks.toggleTaskDone("Mobile task");
    await tasks.expectTaskVisible("Done");

    // Toggle back to todo
    await tasks.toggleTaskDone("Mobile task");
    await tasks.expectTaskVisible("Todo");

    // Tap row to expand, then edit
    await tasks.openEditDialog("Mobile task");
    await tasks.editTaskTitle("Mobile task updated");

    // Tap row to expand, then delete
    await tasks.deleteTask("Mobile task updated");
    await tasks.expectEmptyState();
  });
});

test.describe("mobile: filter bar layout", () => {
  test("new task button is visible on mobile", async ({ tasksMobilePage: tasks }) => {
    await expect(tasks.newTaskButton).toBeVisible();
  });
});

test.describe("mobile: bottom tab bar", () => {
  test("bottom tab bar is visible on mobile", async ({ tasksMobilePage: tasks }) => {
    await expect(tasks.bottomTabBar).toBeVisible();
    await expect(tasks.bottomTabBar.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(tasks.bottomTabBar.getByRole("link", { name: "Trash" })).toBeVisible();
  });
});
