import { useSortable } from "@dnd-kit/react/sortable";
import { SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem } from "@foundation/ui/components/sidebar";
import { cn } from "@foundation/ui/utils/cn";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import type { CategoryItem } from "../../api/categories/list-categories";
import type { CategoryColor } from "../../types/categories";
import { CategoryColorDot } from "./category-color-dot";
import { CategoryInlineRename } from "./category-inline-rename";
import { CategoryItemActions } from "./category-item-actions";

type SortableCategoryItemProps = {
  category: CategoryItem;
  index: number;
  isActive: boolean;
  isRenaming: boolean;
  onRename: () => void;
  onRenameComplete: () => void;
  onDelete: () => void;
};

export function SortableCategoryItem({
  category,
  index,
  isActive,
  isRenaming,
  onRename,
  onRenameComplete,
  onDelete,
}: SortableCategoryItemProps) {
  const { ref, handleRef, isDragging } = useSortable({ id: category.id, index });

  return (
    <SidebarMenuItem ref={ref} className={cn(isDragging && "opacity-50")}>
      {isRenaming ? (
        <CategoryInlineRename category={category} onComplete={onRenameComplete} />
      ) : (
        <>
          <button
            ref={handleRef}
            type="button"
            className="absolute top-1/2 left-0 z-10 flex h-full w-5 -translate-y-1/2 cursor-grab items-center justify-center opacity-0 transition-opacity group-hover/menu-item:opacity-100 group-data-[collapsible=icon]:hidden"
            aria-label={`Reorder ${category.name}`}
            tabIndex={-1}
          >
            <DotsSixVerticalIcon className="size-3 text-sidebar-foreground/50" weight="bold" />
          </button>
          <SidebarMenuButton
            render={<Link to="/dashboard" search={{ category: category.id }} />}
            tooltip={{ children: category.name, sideOffset: 6 }}
            isActive={isActive}
            className="pl-5 group-data-[collapsible=icon]:justify-center"
          >
            <CategoryColorDot color={category.color as CategoryColor} />
            <span>{category.name}</span>
          </SidebarMenuButton>
          {category.itemCount > 0 && <SidebarMenuBadge className="right-8">{category.itemCount}</SidebarMenuBadge>}
          <CategoryItemActions category={category} onRename={onRename} onDelete={onDelete} />
        </>
      )}
    </SidebarMenuItem>
  );
}
