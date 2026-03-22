export type {
  CreateItemInput,
  ItemPriority,
  ItemStatus,
  UpdateItemInput,
} from "@foundation/types/schemas/items";

export { itemPriorityValues, itemStatusValues } from "@foundation/types/schemas/items";

/** Item as returned by the API (JSON wire format — dates are ISO strings, not Date objects) */
export type { ItemEntry as Item } from "../api/items/list-items";
