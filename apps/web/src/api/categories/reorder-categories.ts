import { useMutation, useQueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { rpc } from "../../lib/rpc";
import type { ReorderCategoriesInput } from "../../types/categories";
import { type CategoryListResponse, categoriesQueryKey } from "./list-categories";

async function reorderCategories(data: ReorderCategoriesInput) {
  const res = await rpc.api.categories.reorder.$patch({ json: data });
  await throwIfNotOk(res, "Failed to reorder categories");
  return res.json();
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderCategories,
    meta: {
      errorMessage: "Failed to reorder categories",
    },
    onMutate: async ({ ids }) => {
      await queryClient.cancelQueries({ queryKey: categoriesQueryKey });

      const previousData = queryClient.getQueryData<CategoryListResponse>(categoriesQueryKey);

      queryClient.setQueryData<CategoryListResponse>(categoriesQueryKey, (old) => {
        if (!old) return old;
        const categoryMap = new Map(old.categories.map((cat) => [cat.id, cat]));
        const reordered = ids
          .map((id, index) => {
            const cat = categoryMap.get(id);
            return cat ? { ...cat, order: index } : undefined;
          })
          .filter(Boolean) as CategoryListResponse["categories"];
        return { categories: reordered };
      });

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(categoriesQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesQueryKey, refetchType: "none" });
    },
  });
}
