import { useEffect } from "react";

const NEW_ITEM_EVENT = "item:new-item";
const NEW_CATEGORY_EVENT = "item:new-category";

/** Imperatively trigger a new item dialog from anywhere. */
export function triggerNewItem() {
  document.dispatchEvent(new CustomEvent(NEW_ITEM_EVENT));
}

/** Imperatively trigger a new category dialog from anywhere. */
export function triggerNewCategory() {
  document.dispatchEvent(new CustomEvent(NEW_CATEGORY_EVENT));
}

/** Listen for the "new item" quick action. */
export function useNewItemAction(handler: () => void) {
  useEffect(() => {
    document.addEventListener(NEW_ITEM_EVENT, handler);
    return () => document.removeEventListener(NEW_ITEM_EVENT, handler);
  }, [handler]);
}

/** Listen for the "new category" quick action. */
export function useNewCategoryAction(handler: () => void) {
  useEffect(() => {
    document.addEventListener(NEW_CATEGORY_EVENT, handler);
    return () => document.removeEventListener(NEW_CATEGORY_EVENT, handler);
  }, [handler]);
}
