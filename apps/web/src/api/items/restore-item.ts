import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { rpc } from "../../lib/rpc";
import { type ItemListResponse, itemsQueryKey } from "./list-items";

async function restoreItem(id: string) {
  const res = await rpc.api.items[":id"].restore.$post({ param: { id } });
  await throwIfNotOk(res, "Failed to restore item");
  return res.json();
}

export function useRestoreItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreItem,
    meta: {
      successMessage: "Item restored",
      errorMessage: "Failed to restore item",
    },
    onMutate: async (restoredId) => {
      await queryClient.cancelQueries({ queryKey: itemsQueryKey });

      const previousData = queryClient.getQueriesData<InfiniteData<ItemListResponse>>({
        queryKey: itemsQueryKey,
      });

      // Optimistically remove from trash list
      queryClient.setQueriesData<InfiniteData<ItemListResponse>>({ queryKey: itemsQueryKey }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.id !== restoredId),
          })),
        };
      });

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: itemsQueryKey, refetchType: "none" });
    },
  });
}
