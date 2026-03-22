import { createId } from "@paralleldrive/cuid2";
import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { rpc } from "../../lib/rpc";
import type { CreateItemInput } from "../../types/items";
import { categoriesQueryKey } from "../categories/list-categories";
import { type ItemListResponse, itemsQueryKey } from "./list-items";

async function createItem(data: CreateItemInput) {
  const res = await rpc.api.items.$post({ json: data });
  await throwIfNotOk(res, "Failed to create item");
  return res.json();
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItem,
    meta: {
      successMessage: "Item created",
      errorMessage: "Failed to create item",
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: itemsQueryKey });

      const previousData = queryClient.getQueriesData<InfiniteData<ItemListResponse>>({
        queryKey: itemsQueryKey,
      });

      const optimisticId = createId();
      const now = new Date().toISOString();
      const optimisticItem: ItemListResponse["items"][number] = {
        id: optimisticId,
        userId: "",
        title: newItem.title,
        description: newItem.description ?? null,
        status: newItem.status ?? "todo",
        priority: newItem.priority ?? "none",
        dateDue: newItem.dateDue ? newItem.dateDue.toISOString() : null,
        dateCreated: now,
        dateUpdated: now,
        dateDeleted: null,
        categoryId: newItem.categoryId ?? null,
      };

      queryClient.setQueriesData<InfiniteData<ItemListResponse>>({ queryKey: itemsQueryKey }, (old) => {
        if (!old) return old;
        const firstPage = old.pages[0];
        return {
          ...old,
          pages: [{ ...firstPage, items: [optimisticItem, ...firstPage.items] }, ...old.pages.slice(1)],
        };
      });

      return { previousData, optimisticId };
    },
    onSuccess: (response, _vars, context) => {
      if (!context?.optimisticId) return;
      queryClient.setQueriesData<InfiniteData<ItemListResponse>>({ queryKey: itemsQueryKey }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (item.id === context.optimisticId ? response.item : item)),
          })),
        };
      });
    },
    onError: (_err, _newItem, context) => {
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
