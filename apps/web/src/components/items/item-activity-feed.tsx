import { Button } from "@foundation/ui/components/button";
import { Skeleton } from "@foundation/ui/components/skeleton";
import { cn } from "@foundation/ui/utils/cn";
import { ArrowCounterClockwiseIcon, ClockIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { format } from "date-fns/fp/format";
import { formatDistanceWithOptions } from "date-fns/fp/formatDistanceWithOptions";
import type { ReactNode } from "react";
import type { ItemAuditLogEntry } from "../../api/items/item-activity";
import { useItemActivity } from "../../api/items/item-activity";

type ItemActivityFeedProps = {
  itemId: string;
};

export function ItemActivityFeed({ itemId }: ItemActivityFeedProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useItemActivity(itemId);

  const entries = data?.pages.flatMap((page) => page.activity) ?? [];

  return (
    <div>
      {isLoading ? (
        <ActivitySkeleton />
      ) : entries.length === 0 ? (
        <ActivityEmpty />
      ) : (
        <div>
          <div className="divide-y">
            {entries.map((entry) => (
              <ActivityEntry key={entry.id} entry={entry} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-2 pb-1">
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

function ActivityEntry({ entry }: { entry: ItemAuditLogEntry }) {
  const config = actionConfig[entry.action] ?? actionConfig.update;
  const changes = getChangedFields(entry);

  return (
    <div className="flex gap-3 py-2.5">
      <div className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", config.className)}>
        {config.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{config.label}</span>
          <span className="text-xs text-muted-foreground">{formatTimestamp(entry.timestamp)}</span>
        </div>

        {changes.length > 0 && (
          <div className="mt-1.5 space-y-1">
            {changes.map((change) => (
              <div key={change.field} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{change.label}:</span>{" "}
                <span className="line-through">{formatFieldValue(change.field, change.before)}</span>
                {" \u2192 "}
                <span className="text-foreground">{formatFieldValue(change.field, change.after)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 3 }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders never reorder
        <div key={i} className="flex gap-3">
          <Skeleton className="size-6 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <ClockIcon className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No activity yet</p>
    </div>
  );
}

const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  status: "Status",
  priority: "Priority",
  dateDue: "Due date",
  dateDeleted: "Deleted",
};

const actionConfig: Record<string, { label: string; icon: ReactNode; className: string }> = {
  create: {
    label: "Created",
    icon: <PlusIcon className="size-3.5" weight="bold" />,
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  update: {
    label: "Updated",
    icon: <PencilSimpleIcon className="size-3.5" weight="bold" />,
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  delete: {
    label: "Deleted",
    icon: <TrashIcon className="size-3.5" weight="bold" />,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  restore: {
    label: "Restored",
    icon: <ArrowCounterClockwiseIcon className="size-3.5" weight="bold" />,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  hard_delete: {
    label: "Permanently deleted",
    icon: <TrashIcon className="size-3.5" weight="bold" />,
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const formatShortDate = format("MMM d");
const formatShortDateWithYear = format("MMM d, yyyy");

type ChangedField = { field: string; label: string; before: unknown; after: unknown };

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return formatDistanceWithOptions({ addSuffix: true })(now)(date);
  return date.getFullYear() !== now.getFullYear() ? formatShortDateWithYear(date) : formatShortDate(date);
}

function formatFieldValue(field: string, value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (field === "dateDue" || field === "dateDeleted") return formatShortDate(new Date(value as string));
  if (field === "status") {
    const s = value as string;
    return s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1);
  }
  if (field === "priority") {
    const p = value as string;
    return p.charAt(0).toUpperCase() + p.slice(1);
  }
  if (typeof value === "string") return value.length > 80 ? `${value.slice(0, 80)}...` : value;
  return String(value);
}

function getChangedFields(entry: ItemAuditLogEntry): Array<ChangedField> {
  if (entry.action !== "update") return [];
  const before = entry.beforeState as Record<string, unknown> | null;
  const after = entry.afterState as Record<string, unknown> | null;
  if (!before || !after) return [];
  const tracked = Object.keys(FIELD_LABELS);
  const changes: Array<ChangedField> = [];
  for (const field of tracked) {
    const bNorm = before[field] ?? null;
    const aNorm = after[field] ?? null;
    if (JSON.stringify(bNorm) !== JSON.stringify(aNorm)) {
      changes.push({ field, label: FIELD_LABELS[field], before: bNorm, after: aNorm });
    }
  }
  return changes;
}
