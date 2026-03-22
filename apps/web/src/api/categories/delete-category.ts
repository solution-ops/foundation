import { useMutation, useQueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { rpc } from "../../lib/rpc";
import { itemsQueryKey } from "../items/list-items";
import { type CategoryListResponse, categoriesQueryKey } from "./list-categories";

async function deleteCategory(id: string) {
  const res = await rpc.api.categories[":id"].$delete({ param: { id } });
  await throwIfNotOk(res, "Failed to delete category");
  return res.json();
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    meta: {
      successMessage: "Category deleted",
      errorMessage: "Failed to delete category",
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: categoriesQueryKey });

      const previousData = queryClient.getQueryData<CategoryListResponse>(categoriesQueryKey);

      queryClient.setQueryData<CategoryListResponse>(categoriesQueryKey, (old) => {
        if (!old) return old;
        return {
          categories: old.categories.filter((cat) => cat.id !== deletedId),
        };
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
      // Tasks may have been uncategorized
      queryClient.invalidateQueries({ queryKey: itemsQueryKey });
    },
  });
}
