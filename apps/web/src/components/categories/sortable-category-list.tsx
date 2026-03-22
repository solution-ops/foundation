import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { SidebarMenu } from "@foundation/ui/components/sidebar";
import type { CategoryItem } from "../../api/categories/list-categories";
import { useReorderCategories } from "../../api/categories/reorder-categories";
import { SortableCategoryItem } from "./sortable-category-item";

type SortableCategoryListProps = {
  categories: Array<CategoryItem>;
  activeCategoryId: string | null;
  renamingId: string | null;
  onRename: (id: string) => void;
  onRenameComplete: () => void;
  onDelete: (category: CategoryItem) => void;
};

export function SortableCategoryList({
  categories,
  activeCategoryId,
  renamingId,
  onRename,
  onRenameComplete,
  onDelete,
}: SortableCategoryListProps) {
  const reorderCategories = useReorderCategories();

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        const { source } = event.operation;

        if (isSortable(source)) {
          const { initialIndex, index } = source;

          if (initialIndex !== index) {
            const newOrder = [...categories];
            const [moved] = newOrder.splice(initialIndex, 1);
            newOrder.splice(index, 0, moved);
            reorderCategories.mutate({ ids: newOrder.map((c) => c.id) });
          }
        }
      }}
    >
      <SidebarMenu>
        {categories.map((category, index) => (
          <SortableCategoryItem
            key={category.id}
            category={category}
            index={index}
            isActive={activeCategoryId === category.id}
            isRenaming={renamingId === category.id}
            onRename={() => onRename(category.id)}
            onRenameComplete={onRenameComplete}
            onDelete={() => onDelete(category)}
          />
        ))}
      </SidebarMenu>
    </DragDropProvider>
  );
}
