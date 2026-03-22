import { createFileRoute } from "@tanstack/react-router";

import { queryClient } from "@foundation/ui/components/provider";

import { listItemsQueryOptions } from "../api/items/list-items";
import { TrashList } from "../components/items/trash-list";

export const Route = createFileRoute("/_auth/trash")({
  loader: () => queryClient.ensureInfiniteQueryData(listItemsQueryOptions({ deleted: true })),
  component: Trash,
});

function Trash() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trash</h1>
        <p className="text-sm text-muted-foreground">Deleted items are permanently removed after 30 days.</p>
      </div>
      <TrashList />
    </div>
  );
}
