import { test } from "../config/setup";

test("user can soft-delete an item, view it in trash, and restore it", async ({
  itemsDesktopPage: items,
  trashDesktopPage: trash,
}) => {
  // User lands on the dashboard and sees it's empty
  await items.expectLoaded();
  await items.expectEmptyState();

  // User creates an item
  await items.createItem("Trash test item");
  await items.expectItemVisible("Todo");

  // User deletes the item (soft-delete -> "Move to trash" dialog)
  await items.deleteItem("Trash test item");
  await items.expectItemNotVisible("Trash test item");
  await items.expectEmptyState();

  // User navigates to trash via the sidebar
  await trash.navigateToTrash();
  await trash.expectItemVisible("Trash test item");
  await trash.expectDeletedToday("Trash test item");

  // User restores the item from the trash
  await trash.restoreItem("Trash test item");
  await trash.expectEmptyState();

  // User navigates back to the dashboard and sees the restored item
  await trash.navigateToDashboard();
  await items.expectItemVisible("Trash test item");

  // Clean up: delete the item again
  await items.deleteItem("Trash test item");
  await items.expectEmptyState();
});
