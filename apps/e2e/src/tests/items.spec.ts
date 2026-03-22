import { test } from "../config/setup";

test("user can create, edit, and delete tasks", async ({ tasksDesktopPage: tasks }) => {
  // User lands on the dashboard and sees it's empty
  await tasks.expectLoaded();
  await tasks.expectEmptyState();

  // User creates their first task
  await tasks.createTask("Buy groceries", { description: "Milk, eggs, bread" });
  await tasks.expectTaskVisible("Todo");

  // User marks the task as done
  await tasks.toggleTaskDone("Buy groceries");
  await tasks.expectTaskVisible("Done");

  // User changes their mind and marks it back to todo
  await tasks.toggleTaskDone("Buy groceries");
  await tasks.expectTaskVisible("Todo");

  // User edits the task title
  await tasks.openEditDialog("Buy groceries");
  await tasks.editTaskTitle("Buy organic groceries");

  // User creates a second task with high priority
  await tasks.createTask("Finish report", { priority: "High" });
  await tasks.expectTaskVisible("High");

  // User deletes the first task
  await tasks.deleteTask("Buy organic groceries");
  await tasks.expectTaskNotVisible("Buy organic groceries");
  await tasks.expectTaskVisible("Finish report");

  // User deletes the remaining task and sees the empty state again
  await tasks.deleteFirstTask();
  await tasks.expectEmptyState();
});
