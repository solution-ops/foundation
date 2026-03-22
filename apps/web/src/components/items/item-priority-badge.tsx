import { Badge } from "@foundation/ui/components/badge";
import type { ItemPriority } from "../../types/items";

const priorityConfig: Record<ItemPriority, { label: string; className: string } | null> = {
  none: null,
  low: { label: "Low", className: "bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-400" },
  medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  high: { label: "High", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export function ItemPriorityBadge({ priority }: { priority: ItemPriority }) {
  const config = priorityConfig[priority];
  if (!config) return null;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
