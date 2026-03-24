import { Skeleton } from "@foundation/ui/components/skeleton";
import { CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useListCategories } from "../api/categories/list-categories";
import { CategoryColorDot } from "../components/categories/category-color-dot";
import { CreateCategoryDialog } from "../components/categories/create-category-dialog";
import type { CategoryColor } from "../types/categories";

export const Route = createFileRoute("/_auth/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const { data, isLoading } = useListCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const categories = data?.categories ?? [];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Categories</h1>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          aria-label="New category"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <PlusIcon className="size-4" weight="bold" />
          <span>New</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-1">
          {["s1", "s2", "s3", "s4"].map((id) => (
            <div key={id} className="flex items-center gap-3 px-3 py-3">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No categories yet</p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Create your first category
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              to="/dashboard"
              search={{ category: category.id }}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-muted"
            >
              <CategoryColorDot color={category.color as CategoryColor} />
              <span className="flex-1 text-sm font-medium">{category.name}</span>
              <CaretRightIcon className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}

      <CreateCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
