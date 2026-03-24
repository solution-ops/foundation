import { expect, test } from "../config/setup";

test.describe("mobile: trash and restore flow", () => {
  test("user can soft-delete, view trash, and restore on mobile", async ({
    itemsMobilePage: items,
    trashMobilePage: trash,
  }) => {
    // User lands on the dashboard and sees it's empty
    await items.expectLoaded();
    await items.expectEmptyState();

    // User creates an item
    await items.createItem("Mobile trash item");
    await items.expectItemVisible("Todo");

    // User deletes the item via tap-to-expand (soft-delete -> "Move to trash" dialog)
    await items.deleteItem("Mobile trash item");
    await items.expectItemNotVisible("Mobile trash item");
    await items.expectEmptyState();

    // User navigates to trash via the bottom tab bar
    await trash.navigateToTrash();
    await trash.expectItemVisible("Mobile trash item");

    // User taps trash row to expand and restores the item
    await trash.restoreItem("Mobile trash item");
    await trash.expectEmptyState();

    // User navigates back to the dashboard and sees the restored item
    await trash.navigateToDashboard();
    await expect(items.heading).toBeVisible();
    await items.expectItemVisible("Mobile trash item");

    // Clean up: delete the item again
    await items.deleteItem("Mobile trash item");
    await items.expectEmptyState();
  });
});
