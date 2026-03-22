import { queryOptions, useQuery } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { type InferResponseType, rpc } from "../../lib/rpc";

export const categoriesQueryKey = ["categories"] as const;

/** Response type for list categories endpoint */
export type CategoryListResponse = InferResponseType<typeof rpc.api.categories.$get, 200>;

/** Individual category item from the list response */
export type CategoryItem = CategoryListResponse["categories"][number];

export function listCategoriesQueryOptions() {
  return queryOptions({
    queryKey: [...categoriesQueryKey],
    queryFn: async () => {
      const res = await rpc.api.categories.$get();
      await throwIfNotOk(res, "Failed to fetch categories");
      return res.json();
    },
  });
}

export function useListCategories() {
  return useQuery(listCategoriesQueryOptions());
}
