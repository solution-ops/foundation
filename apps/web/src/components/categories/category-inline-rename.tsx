import { MAX_CATEGORY_NAME_LENGTH } from "@foundation/constants/category-colors";
import { Input } from "@foundation/ui/components/input";
import { SidebarMenuButton } from "@foundation/ui/components/sidebar";
import { useEffect, useRef } from "react";
import type { CategoryItem } from "../../api/categories/list-categories";
import { useUpdateCategory } from "../../api/categories/update-category";
import type { CategoryColor } from "../../types/categories";
import { CategoryColorDot } from "./category-color-dot";

type CategoryInlineRenameProps = {
  category: CategoryItem;
  onComplete: () => void;
};

export function CategoryInlineRename({ category, onComplete }: CategoryInlineRenameProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateCategory = useUpdateCategory();
  const savedRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Delay focus slightly so the dropdown's focus-return logic settles first
    const raf = requestAnimationFrame(() => {
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.select();
      }
      mountedRef.current = true;
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  function save() {
    if (savedRef.current) return;
    const input = inputRef.current;
    if (!input) return;

    const trimmed = input.value.trim();
    if (trimmed && trimmed !== category.name && trimmed.length <= MAX_CATEGORY_NAME_LENGTH) {
      savedRef.current = true;
      updateCategory.mutate({ id: category.id, data: { name: trimmed } });
    }
    onComplete();
  }

  return (
    <SidebarMenuButton className="gap-2">
      <CategoryColorDot color={category.color as CategoryColor} />
      <Input
        ref={inputRef}
        type="text"
        defaultValue={category.name}
        maxLength={MAX_CATEGORY_NAME_LENGTH}
        className="h-auto flex-1 rounded-sm border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-1"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onComplete();
          }
        }}
        onBlur={() => {
          // Ignore blur events before the input is fully mounted
          // (the dropdown's focus-return can fire blur prematurely)
          if (mountedRef.current) save();
        }}
      />
    </SidebarMenuButton>
  );
}
