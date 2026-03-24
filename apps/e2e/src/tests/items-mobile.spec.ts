import { expect, test } from "../config/setup";

test.describe("mobile: item row tap-to-expand", () => {
  test("tapping an item row reveals edit and delete actions", async ({ itemsMobilePage: items }) => {
    await items.createItem("Tap test item");

    // Desktop dropdown menu should NOT be rendered on mobile
    await items.expectNoDropdownMenu();

    // Item row should be tappable (role="button")
    await expect(items.itemRow("Tap test item")).toBeVisible();

    // Tap to expand — edit and delete buttons appear
    await items.expandItemRow("Tap test item");
    await expect(items.expandedDeleteButton).toBeVisible();

    // Tap again to collapse — buttons disappear
    await items.collapseItemRow("Tap test item");
    await expect(items.expandedDeleteButton).not.toBeVisible();

    // Clean up
    await items.deleteItem("Tap test item");
    await items.expectEmptyState();
  });
});

test.describe("mobile: full crud flow", () => {
  test("user can create, edit, and delete items on mobile", async ({ itemsMobilePage: items }) => {
    // Empty state
    await items.expectLoaded();
    await items.expectEmptyState();

    // Create an item
    await items.createItem("Mobile item");
    await items.expectItemVisible("Todo");

    // Toggle done via checkbox (same UX on mobile)
    await items.toggleItemDone("Mobile item");
    await items.expectItemVisible("Done");

    // Toggle back to todo
    await items.toggleItemDone("Mobile item");
    await items.expectItemVisible("Todo");

    // Tap row to expand, then edit
    await items.openEditDialog("Mobile item");
    await items.editItemTitle("Mobile item updated");

    // Tap row to expand, then delete
    await items.deleteItem("Mobile item updated");
    await items.expectEmptyState();
  });
});

test.describe("mobile: filter bar layout", () => {
  test("new item button is visible on mobile", async ({ itemsMobilePage: items }) => {
    await expect(items.newItemButton).toBeVisible();
  });
});

test.describe("mobile: bottom tab bar", () => {
  test("bottom tab bar is visible on mobile", async ({ itemsMobilePage: items }) => {
    await expect(items.bottomTabBar).toBeVisible();
    await expect(items.bottomTabBar.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(items.bottomTabBar.getByRole("link", { name: "Trash" })).toBeVisible();
  });
});
