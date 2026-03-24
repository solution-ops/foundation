import { Button } from "@foundation/ui/components/button";
import { Checkbox } from "@foundation/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@foundation/ui/components/dropdown-menu";
import { useIsMobile } from "@foundation/ui/hooks/use-mobile";
import { cn } from "@foundation/ui/utils/cn";
import { DotsThreeIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { useListCategories } from "../../api/categories/list-categories";
import type { CategoryColor } from "../../types/categories";
import type { Item, ItemPriority, ItemStatus } from "../../types/items";
import { CategoryColorDot } from "../categories/category-color-dot";
import { ItemPriorityBadge } from "./item-priority-badge";
import { ItemStatusBadge } from "./item-status-badge";

type ItemRowProps = {
  item: Item;
  onToggleDone: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
};

function formatDueDate(date: string | Date | null): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ItemRow({ item, onToggleDone, onEdit, onDelete }: ItemRowProps) {
  const isDone = item.status === "done";
  const dueDate = formatDueDate(item.dateDue);
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const { data: categoriesData } = useListCategories();
  const category = item.categoryId ? categoriesData?.categories.find((c) => c.id === item.categoryId) : undefined;

  return (
    <div className="rounded-md border transition-colors hover:bg-muted/50">
      {/* biome-ignore lint/a11y/noStaticElementInteractions: role is conditionally set based on isMobile */}
      <div
        className="group flex items-center gap-3 px-3 py-2.5"
        role={isMobile ? "button" : undefined}
        tabIndex={isMobile ? 0 : undefined}
        onClick={isMobile ? () => setExpanded((prev) => !prev) : undefined}
        onKeyDown={
          isMobile
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpanded((prev) => !prev);
                }
              }
            : undefined
        }
      >
        <Checkbox
          checked={isDone}
          onCheckedChange={() => onToggleDone(item)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Mark "${item.title}" as ${isDone ? "todo" : "done"}`}
        />

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className={cn("truncate text-sm", isDone && "text-muted-foreground line-through")}>{item.title}</span>
          {category && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
              <CategoryColorDot color={category.color as CategoryColor} />
              <span className="hidden sm:inline">{category.name}</span>
            </span>
          )}
          <div className="flex shrink-0 items-center gap-1.5">
            <ItemStatusBadge status={item.status as ItemStatus} />
            <ItemPriorityBadge priority={item.priority as ItemPriority} />
          </div>
        </div>

        {dueDate && <span className="shrink-0 text-xs text-muted-foreground">{dueDate}</span>}

        {!isMobile && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Item actions"
                />
              }
            >
              <DotsThreeIcon weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <PencilSimpleIcon />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
                <TrashIcon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isMobile && expanded && (
        <div className="flex items-center gap-2 border-t px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpanded(false);
              onEdit(item);
            }}
          >
            <PencilSimpleIcon />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setExpanded(false);
              onDelete(item);
            }}
          >
            <TrashIcon />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
