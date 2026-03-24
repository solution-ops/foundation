import { expect, test } from "../config/setup";

test("user can edit an item and view activity audit logs", async ({ authenticatedPage, itemsDesktopPage: items }) => {
  // User lands on the dashboard and sees it's empty
  await items.expectLoaded();
  await items.expectEmptyState();

  // User creates an item
  await items.createItem("Activity test item", { description: "Original description" });
  await items.expectItemVisible("Activity test item");

  // User edits the item title
  await items.openEditDialog("Activity test item");
  await items.editItemTitle("Activity test item updated");

  // User opens the edit dialog again and switches to the Activity tab
  await items.openEditDialog("Activity test item updated");
  await items.switchToActivityTab();

  // User sees the "Created" audit log entry
  await items.expectActivityEntry("Created");

  // User sees the "Updated" audit log entry with field-level diff
  await items.expectActivityEntry("Updated");
  await items.expectActivityFieldChange("Title");

  // User switches back to the Details tab and verifies form state is preserved
  await items.switchToDetailsTab();
  await expect(items.titleInput).toHaveValue("Activity test item updated");

  // User closes the dialog by pressing Escape
  await authenticatedPage.keyboard.press("Escape");
  await expect(items.editItemHeading).not.toBeVisible();

  // Clean up: delete the item
  await items.deleteItem("Activity test item updated");
  await items.expectEmptyState();
});
