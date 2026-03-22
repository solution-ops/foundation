import { DotsThreeIcon, PaletteIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@foundation/ui/components/dropdown-menu";
import { SidebarMenuAction } from "@foundation/ui/components/sidebar";
import type { CategoryItem } from "../../api/categories/list-categories";
import { useUpdateCategory } from "../../api/categories/update-category";
import type { CategoryColor } from "../../types/categories";
import { CategoryColorPicker } from "./category-color-picker";

type CategoryItemActionsProps = {
  category: CategoryItem;
  onRename: () => void;
  onDelete: () => void;
};

export function CategoryItemActions({ category, onRename, onDelete }: CategoryItemActionsProps) {
  const updateCategory = useUpdateCategory();

  function handleColorChange(color: CategoryColor) {
    updateCategory.mutate({ id: category.id, data: { color } });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuAction showOnHover aria-label="Category actions" />}>
        <DotsThreeIcon weight="bold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start">
        <DropdownMenuItem onClick={onRename}>
          <PencilSimpleIcon />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <PaletteIcon />
            Change color
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <CategoryColorPicker currentColor={category.color as CategoryColor} onColorChange={handleColorChange} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
