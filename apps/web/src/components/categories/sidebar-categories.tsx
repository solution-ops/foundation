import { createId } from "@paralleldrive/cuid2";
import { CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import { useLocation } from "@tanstack/react-router";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@foundation/ui/components/sidebar";
import { Skeleton } from "@foundation/ui/components/skeleton";
import { cn } from "@foundation/ui/utils/cn";
import { useCallback, useMemo, useState } from "react";
import { type CategoryItem, useListCategories } from "../../api/categories/list-categories";
import { useNewCategoryAction } from "../../hooks/use-quick-actions";
import { CreateCategoryDialog } from "./create-category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { SortableCategoryList } from "./sortable-category-list";

export function SidebarCategories() {
  const [isOpen, setIsOpen] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDialog = useCallback(() => setDialogOpen(true), []);
  useNewCategoryAction(openDialog);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const { data, isLoading } = useListCategories();
  const location = useLocation();

  const skeletonKeys = useMemo(() => Array.from({ length: 3 }, () => createId()), []);
  const categories = data?.categories ?? [];

  // Parse active category from URL search params
  const searchParams = new URLSearchParams(location.search);
  const activeCategoryId = location.pathname === "/dashboard" ? searchParams.get("category") : null;

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel
          className="cursor-pointer select-none"
          onClick={() => setIsOpen((prev) => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen((prev) => !prev);
            }
          }}
        >
          <CaretRightIcon
            weight="bold"
            className={cn("mr-1 size-3 transition-transform duration-200", isOpen && "rotate-90")}
          />
          Categories
        </SidebarGroupLabel>

        <SidebarGroupAction onClick={() => setDialogOpen(true)} title="Add category">
          <PlusIcon weight="bold" />
          <span className="sr-only">Add category</span>
        </SidebarGroupAction>

        {isOpen && (
          <SidebarGroupContent>
            {isLoading ? (
              <SidebarMenu>
                {skeletonKeys.map((id) => (
                  <SidebarMenuItem key={id}>
                    <div className="flex h-8 items-center gap-2 px-2">
                      <Skeleton className="size-2.5 shrink-0 rounded-full" />
                      <Skeleton className="h-3.5 flex-1" />
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            ) : categories.length > 0 ? (
              <SortableCategoryList
                categories={categories}
                activeCategoryId={activeCategoryId}
                renamingId={renamingId}
                onRename={setRenamingId}
                onRenameComplete={() => setRenamingId(null)}
                onDelete={setDeletingCategory}
              />
            ) : (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="text-sidebar-foreground/50 text-xs" onClick={() => setDialogOpen(true)}>
                    <PlusIcon />
                    <span>Add a category</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        )}
      </SidebarGroup>

      <CreateCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <DeleteCategoryDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        category={deletingCategory}
      />
    </>
  );
}
