import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { rpc } from "../../lib/rpc";
import type { UpdateItemInput } from "../../types/items";
import { categoriesQueryKey } from "../categories/list-categories";
import { type ItemListResponse, itemsQueryKey } from "./list-items";

async function updateItem({ id, data }: { id: string; data: UpdateItemInput }) {
  const res = await rpc.api.items[":id"].$patch({ param: { id }, json: data });
  await throwIfNotOk(res, "Failed to update item");
  return res.json();
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateItem,
    meta: {
      successMessage: "Item updated",
      errorMessage: "Failed to update item",
    },
    onMutate: async ({ id, data }) => {
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
            items: page.items.map((item) => {
              if (item.id !== id) return item;
              return {
                ...item,
                ...data,
                // Convert Date -> ISO string to match JSON wire format
                dateDue: data.dateDue !== undefined ? (data.dateDue ? data.dateDue.toISOString() : null) : item.dateDue,
                dateUpdated: new Date().toISOString(),
              };
            }),
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
