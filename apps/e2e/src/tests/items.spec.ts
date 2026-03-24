import { test } from "../config/setup";

test("user can create, edit, and delete items", async ({ itemsDesktopPage: items }) => {
  // User lands on the dashboard and sees it's empty
  await items.expectLoaded();
  await items.expectEmptyState();

  // User creates their first item
  await items.createItem("Buy groceries", { description: "Milk, eggs, bread" });
  await items.expectItemVisible("Todo");

  // User marks the item as done
  await items.toggleItemDone("Buy groceries");
  await items.expectItemVisible("Done");

  // User changes their mind and marks it back to todo
  await items.toggleItemDone("Buy groceries");
  await items.expectItemVisible("Todo");

  // User edits the item title
  await items.openEditDialog("Buy groceries");
  await items.editItemTitle("Buy organic groceries");

  // User creates a second item with high priority
  await items.createItem("Finish report", { priority: "High" });
  await items.expectItemVisible("High");

  // User deletes the first item
  await items.deleteItem("Buy organic groceries");
  await items.expectItemNotVisible("Buy organic groceries");
  await items.expectItemVisible("Finish report");

  // User deletes the remaining item and sees the empty state again
  await items.deleteFirstItem();
  await items.expectEmptyState();
});
