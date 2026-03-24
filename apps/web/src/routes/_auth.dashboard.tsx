import { queryClient } from "@foundation/ui/components/provider";
import { createFileRoute } from "@tanstack/react-router";
import { object, string } from "zod";

import { listItemsQueryOptions } from "../api/items/list-items";
import { ItemList } from "../components/items/item-list";

const searchSchema = object({
  category: string().optional().catch(""),
});

export const Route = createFileRoute("/_auth/dashboard")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: ({ deps }) =>
    queryClient.ensureInfiniteQueryData(listItemsQueryOptions(deps.category ? { category: deps.category } : {})),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Items</h1>
        <p className="text-sm text-muted-foreground">Manage your items and stay organized.</p>
      </div>
      <ItemList />
    </div>
  );
}
