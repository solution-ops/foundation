import { Button } from "@foundation/ui/components/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@foundation/ui/components/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@foundation/ui/components/popover";
import { useIsMobile } from "@foundation/ui/hooks/use-mobile";
import { cn } from "@foundation/ui/utils/cn";
import { FunnelIcon, PlusIcon, XIcon } from "@phosphor-icons/react";

import { useListCategories } from "../../api/categories/list-categories";
import type { CategoryColor } from "../../types/categories";
import type { ItemPriority, ItemStatus } from "../../types/items";
import { itemPriorityValues, itemStatusValues } from "../../types/items";
import { CategoryColorDot } from "../categories/category-color-dot";

type ItemFiltersProps = {
  status: ItemStatus | undefined;
  priority: ItemPriority | undefined;
  category: string | undefined;
  onStatusChange: (status: ItemStatus | undefined) => void;
  onPriorityChange: (priority: ItemPriority | undefined) => void;
  onCategoryChange: (category: string | undefined) => void;
  onNewItem: () => void;
};

const statusLabels: Record<ItemStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const priorityLabels: Record<ItemPriority, string> = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/30 bg-primary/10 text-foreground"
          : "border-transparent bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function FilterPanel({
  status,
  priority,
  category,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
}: Omit<ItemFiltersProps, "onNewItem">) {
  const { data: categoriesData } = useListCategories();
  const categories = categoriesData?.categories ?? [];

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {itemStatusValues.map((s) => (
            <Chip key={s} active={status === s} onClick={() => onStatusChange(status === s ? undefined : s)}>
              {statusLabels[s]}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Priority</p>
        <div className="flex flex-wrap gap-1.5">
          {itemPriorityValues.map((p) => (
            <Chip key={p} active={priority === p} onClick={() => onPriorityChange(priority === p ? undefined : p)}>
              {priorityLabels[p]}
            </Chip>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Chip
                key={c.id}
                active={category === c.id}
                onClick={() => onCategoryChange(category === c.id ? undefined : c.id)}
              >
                <CategoryColorDot color={c.color as CategoryColor} className="size-2" />
                {c.name}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterTriggerContent({ activeCount }: { activeCount: number }) {
  return (
    <>
      <FunnelIcon weight={activeCount > 0 ? "fill" : "regular"} />
      Filters
      {activeCount > 0 && (
        <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {activeCount}
        </span>
      )}
    </>
  );
}

export function ItemFilters(props: ItemFiltersProps) {
  const { status, priority, category, onStatusChange, onPriorityChange, onCategoryChange, onNewItem } = props;
  const isMobile = useIsMobile();

  const activeCount = [status, priority, category].filter(Boolean).length;

  function handleClearAll() {
    onStatusChange(undefined);
    onPriorityChange(undefined);
    onCategoryChange(undefined);
  }

  const filterControls = (
    <FilterPanel
      status={status}
      priority={priority}
      category={category}
      onStatusChange={onStatusChange}
      onPriorityChange={onPriorityChange}
      onCategoryChange={onCategoryChange}
    />
  );

  return (
    <div className="flex items-center gap-2">
      {isMobile ? (
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm">
              <FilterTriggerContent activeCount={activeCount} />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">{filterControls}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Popover>
          <PopoverTrigger
            render={
              <Button variant="outline" size="sm">
                <FilterTriggerContent activeCount={activeCount} />
              </Button>
            }
          />
          <PopoverContent className="w-72" align="start">
            {filterControls}
          </PopoverContent>
        </Popover>
      )}

      {activeCount > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <XIcon className="size-3" />
          Clear
        </button>
      )}

      <div className="ml-auto">
        <Button size="sm" onClick={onNewItem}>
          <PlusIcon weight="bold" />
          New item
        </Button>
      </div>
    </div>
  );
}
