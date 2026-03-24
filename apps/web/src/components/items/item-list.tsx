import { Button } from "@foundation/ui/components/button";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useListItems } from "../../api/items/list-items";
import { useUpdateItem } from "../../api/items/update-item";
import { useNewItemAction } from "../../hooks/use-quick-actions";
import type { Item, ItemPriority, ItemStatus } from "../../types/items";
import { ItemDeleteDialog } from "./item-delete-dialog";
import { ItemEmptyState } from "./item-empty-state";
import { ItemFilters } from "./item-filters";
import { ItemFormDialog } from "./item-form-dialog";
import { ItemRow } from "./item-row";

export function ItemList() {
  // URL-driven category filter
  const { category: categoryFilter } = useSearch({ from: "/_auth/dashboard" });
  const navigate = useNavigate();

  // Local filter state
  const [statusFilter, setStatusFilter] = useState<ItemStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<ItemPriority | undefined>();

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  // Data
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useListItems({
    status: statusFilter,
    priority: priorityFilter,
    category: categoryFilter || undefined,
  });
  const updateItem = useUpdateItem();

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  const handleNewItem = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  useNewItemAction(handleNewItem);

  function handleEdit(item: Item) {
    setEditingItem(item);
    setFormOpen(true);
  }

  function handleDelete(item: Item) {
    setDeletingItem(item);
    setDeleteOpen(true);
  }

  function handleToggleDone(item: Item) {
    const newStatus = item.status === "done" ? "todo" : "done";
    updateItem.mutate({ id: item.id, data: { status: newStatus } });
  }

  function handleCategoryChange(category: string | undefined) {
    navigate({ to: "/dashboard", search: { category: category || undefined }, replace: true });
  }

  return (
    <div className="space-y-4">
      <ItemFilters
        status={statusFilter}
        priority={priorityFilter}
        category={categoryFilter || undefined}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onCategoryChange={handleCategoryChange}
        onNewItem={handleNewItem}
      />

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-12 animate-pulse rounded-md bg-muted" />
          <div className="h-12 animate-pulse rounded-md bg-muted" />
          <div className="h-12 animate-pulse rounded-md bg-muted" />
        </div>
      ) : items.length === 0 ? (
        <ItemEmptyState onNewItem={handleNewItem} />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onToggleDone={handleToggleDone}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button variant="ghost" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </div>
      )}

      <ItemFormDialog key={editingItem?.id ?? "new"} open={formOpen} onOpenChange={setFormOpen} item={editingItem} />
      <ItemDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} item={deletingItem} />
    </div>
  );
}
