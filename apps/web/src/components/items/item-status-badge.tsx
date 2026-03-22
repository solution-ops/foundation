import { Badge } from "@foundation/ui/components/badge";
import type { ItemStatus } from "../../types/items";

const statusConfig: Record<ItemStatus, { label: string; className: string }> = {
  todo: {
    label: "Todo",
    className: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  done: {
    label: "Done",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
};

export function ItemStatusBadge({ status }: { status: ItemStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
