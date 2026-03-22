import { expect, test } from "../config/setup";

test.describe("mobile: trash and restore flow", () => {
  test("user can soft-delete, view trash, and restore on mobile", async ({
    tasksMobilePage: tasks,
    trashMobilePage: trash,
  }) => {
    // User lands on the dashboard and sees it's empty
    await tasks.expectLoaded();
    await tasks.expectEmptyState();

    // User creates a task
    await tasks.createTask("Mobile trash task");
    await tasks.expectTaskVisible("Todo");

    // User deletes the task via tap-to-expand (soft-delete → "Move to trash" dialog)
    await tasks.deleteTask("Mobile trash task");
    await tasks.expectTaskNotVisible("Mobile trash task");
    await tasks.expectEmptyState();

    // User opens sidebar and navigates to trash
    await trash.navigateToTrash();
    await trash.expectTaskVisible("Mobile trash task");

    // User taps trash row to expand and restores the task
    await trash.restoreTask("Mobile trash task");
    await trash.expectEmptyState();

    // User navigates back to the dashboard and sees the restored task
    await trash.navigateToDashboard();
    await expect(tasks.heading).toBeVisible();
    await tasks.expectTaskVisible("Mobile trash task");

    // Clean up: delete the task again
    await tasks.deleteTask("Mobile trash task");
    await tasks.expectEmptyState();
  });
});
