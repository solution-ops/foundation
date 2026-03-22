import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { rpc } from "../../lib/rpc";
import { categoriesQueryKey } from "../categories/list-categories";
import { type ItemListResponse, itemsQueryKey } from "./list-items";

async function deleteItem(id: string) {
  const res = await rpc.api.items[":id"].$delete({ param: { id } });
  await throwIfNotOk(res, "Failed to delete item");
  return res.json();
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteItem,
    meta: {
      successMessage: "Item moved to trash",
      errorMessage: "Failed to delete item",
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: itemsQueryKey });

      const previousData = queryClient.getQueriesData<InfiniteData<ItemListResponse>>({
        queryKey: itemsQueryKey,
      });

      queryClient.setQueriesData<InfiniteData<ItemListResponse>>({ queryKey: itemsQueryKey }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((item) => item.id !== deletedId),
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
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
    },
  });
}
