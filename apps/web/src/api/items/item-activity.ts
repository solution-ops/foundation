import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { type InferResponseType, rpc } from "../../lib/rpc";

export const itemActivityQueryKey = (itemId: string) => ["item-activity", itemId] as const;

export type ItemActivityResponse = InferResponseType<(typeof rpc.api.items)[":id"]["activity"]["$get"], 200>;

export type ItemAuditLogEntry = ItemActivityResponse["activity"][number];

export function itemActivityQueryOptions(itemId: string) {
  return infiniteQueryOptions({
    queryKey: itemActivityQueryKey(itemId),
    queryFn: async ({ pageParam }) => {
      const query: Record<string, string> = {};
      if (pageParam) query.cursor = pageParam;

      const res = await rpc.api.items[":id"].activity.$get({
        param: { id: itemId },
        query,
      });
      await throwIfNotOk(res, "Failed to fetch item activity");
      return res.json();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!itemId,
  });
}

export function useItemActivity(itemId: string) {
  return useInfiniteQuery(itemActivityQueryOptions(itemId));
}
