import { expect, test } from "../config/setup";

test("user can edit a task and view activity audit logs", async ({ authenticatedPage, tasksDesktopPage: tasks }) => {
  // User lands on the dashboard and sees it's empty
  await tasks.expectLoaded();
  await tasks.expectEmptyState();

  // User creates a task
  await tasks.createTask("Activity test task", { description: "Original description" });
  await tasks.expectTaskVisible("Activity test task");

  // User edits the task title
  await tasks.openEditDialog("Activity test task");
  await tasks.editTaskTitle("Activity test task updated");

  // User opens the edit dialog again and switches to the Activity tab
  await tasks.openEditDialog("Activity test task updated");
  await tasks.switchToActivityTab();

  // User sees the "Created" audit log entry
  await tasks.expectActivityEntry("Created");

  // User sees the "Updated" audit log entry with field-level diff
  await tasks.expectActivityEntry("Updated");
  await tasks.expectActivityFieldChange("Title");

  // User switches back to the Details tab and verifies form state is preserved
  await tasks.switchToDetailsTab();
  await expect(tasks.titleInput).toHaveValue("Activity test task updated");

  // User closes the dialog by pressing Escape
  await authenticatedPage.keyboard.press("Escape");
  await expect(tasks.editTaskHeading).not.toBeVisible();

  // Clean up: delete the task
  await tasks.deleteTask("Activity test task updated");
  await tasks.expectEmptyState();
});
