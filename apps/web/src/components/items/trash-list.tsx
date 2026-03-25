import { Button } from "@foundation/ui/components/button";
import { TrashIcon } from "@phosphor-icons/react";

import { useListItems } from "../../api/items/list-items";
import { TrashRow } from "./trash-row";

export function TrashList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useListItems({ deleted: true });

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-12 animate-pulse rounded-md bg-muted" />
          <div className="h-12 animate-pulse rounded-md bg-muted" />
          <div className="h-12 animate-pulse rounded-md bg-muted" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
          <TrashIcon className="size-10 text-muted-foreground" weight="duotone" />
          <p className="text-sm text-muted-foreground">Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <TrashRow key={item.id} item={item} />
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
    </div>
  );
}
