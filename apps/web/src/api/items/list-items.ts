import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import type { ItemPriority, ItemStatus } from "@foundation/types/schemas/items";
import { throwIfNotOk } from "../../lib/api-error";
import { type InferResponseType, rpc } from "../../lib/rpc";

export const itemsQueryKey = ["items"] as const;

/** Response type for list items endpoint — used by other hooks for cache typing */
export type ItemListResponse = InferResponseType<typeof rpc.api.items.$get, 200>;

/** Single item shape as returned by the API (JSON wire format) */
export type ItemResponse = InferResponseType<(typeof rpc.api.items)[":id"]["$get"], 200>;

/** Individual item from the list response (dates are ISO strings) */
export type ItemEntry = ItemListResponse["items"][number];

type ListItemsFilters = {
  status?: ItemStatus;
  priority?: ItemPriority;
  deleted?: boolean;
  category?: string;
};

export function listItemsQueryOptions(filters: ListItemsFilters = {}) {
  return infiniteQueryOptions({
    queryKey: [...itemsQueryKey, filters],
    queryFn: async ({ pageParam }) => {
      const query: Record<string, string> = {};
      if (pageParam) query.cursor = pageParam;
      if (filters.status) query.status = filters.status;
      if (filters.priority) query.priority = filters.priority;
      if (filters.deleted) query.deleted = "true";
      if (filters.category) query.category = filters.category;

      const res = await rpc.api.items.$get({ query });
      await throwIfNotOk(res, "Failed to fetch items");
      return res.json();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}

export function useListItems(filters: ListItemsFilters = {}) {
  return useInfiniteQuery(listItemsQueryOptions(filters));
}
