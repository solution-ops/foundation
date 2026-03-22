import { createId } from "@paralleldrive/cuid2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { throwIfNotOk } from "../../lib/api-error";
import { rpc } from "../../lib/rpc";
import type { CreateCategoryInput } from "../../types/categories";
import { type CategoryListResponse, categoriesQueryKey } from "./list-categories";

async function createCategory(data: CreateCategoryInput) {
  const res = await rpc.api.categories.$post({ json: data });
  await throwIfNotOk(res, "Failed to create category");
  return res.json();
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    meta: {
      successMessage: "Category created",
      errorMessage: "Failed to create category",
    },
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: categoriesQueryKey });

      const previousData = queryClient.getQueryData<CategoryListResponse>(categoriesQueryKey);

      const optimisticId = createId();
      const now = new Date().toISOString();
      const optimisticCategory: CategoryListResponse["categories"][number] = {
        id: optimisticId,
        userId: "",
        name: newCategory.name,
        color: newCategory.color,
        order: previousData?.categories.length ?? 0,
        dateCreated: now,
        dateUpdated: now,
        taskCount: 0,
      };

      queryClient.setQueryData<CategoryListResponse>(categoriesQueryKey, (old) => {
        if (!old) return { categories: [optimisticCategory] };
        return { categories: [...old.categories, optimisticCategory] };
      });

      return { previousData, optimisticId };
    },
    onSuccess: (response, _vars, context) => {
      if (!context?.optimisticId) return;
      queryClient.setQueryData<CategoryListResponse>(categoriesQueryKey, (old) => {
        if (!old) return old;
        return {
          categories: old.categories.map((cat) =>
            cat.id === context.optimisticId ? { ...response.category, taskCount: 0 } : cat,
          ),
        };
      });
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
