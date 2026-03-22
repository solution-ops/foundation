import { test } from "../config/setup";

test("user can soft-delete a task, view it in trash, and restore it", async ({
  tasksDesktopPage: tasks,
  trashDesktopPage: trash,
}) => {
  // User lands on the dashboard and sees it's empty
  await tasks.expectLoaded();
  await tasks.expectEmptyState();

  // User creates a task
  await tasks.createTask("Trash test task");
  await tasks.expectTaskVisible("Todo");

  // User deletes the task (soft-delete → "Move to trash" dialog)
  await tasks.deleteTask("Trash test task");
  await tasks.expectTaskNotVisible("Trash test task");
  await tasks.expectEmptyState();

  // User navigates to trash via the sidebar
  await trash.navigateToTrash();
  await trash.expectTaskVisible("Trash test task");
  await trash.expectDeletedToday("Trash test task");

  // User restores the task from the trash
  await trash.restoreTask("Trash test task");
  await trash.expectEmptyState();

  // User navigates back to the dashboard and sees the restored task
  await trash.navigateToDashboard();
  await tasks.expectTaskVisible("Trash test task");

  // Clean up: delete the task again
  await tasks.deleteTask("Trash test task");
  await tasks.expectEmptyState();
});
