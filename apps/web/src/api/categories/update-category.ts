import { useMutation, useQueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { rpc } from "../../lib/rpc";
import type { UpdateCategoryInput } from "../../types/categories";
import { type CategoryListResponse, categoriesQueryKey } from "./list-categories";

async function updateCategory({ id, data }: { id: string; data: UpdateCategoryInput }) {
  const res = await rpc.api.categories[":id"].$patch({ param: { id }, json: data });
  await throwIfNotOk(res, "Failed to update category");
  return res.json();
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    meta: {
      successMessage: "Category updated",
      errorMessage: "Failed to update category",
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: categoriesQueryKey });

      const previousData = queryClient.getQueryData<CategoryListResponse>(categoriesQueryKey);

      queryClient.setQueryData<CategoryListResponse>(categoriesQueryKey, (old) => {
        if (!old) return old;
        return {
          categories: old.categories.map((cat) => {
            if (cat.id !== id) return cat;
            return {
              ...cat,
              ...data,
              dateUpdated: new Date().toISOString(),
            };
          }),
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
    },
  });
}
