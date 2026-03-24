import { Button } from "@foundation/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@foundation/ui/components/dropdown-menu";
import { useIsMobile } from "@foundation/ui/hooks/use-mobile";
import { cn } from "@foundation/ui/utils/cn";
import { ArrowCounterClockwiseIcon, DotsThreeIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { useRestoreItem } from "../../api/items/restore-item";
import type { Item, ItemPriority, ItemStatus } from "../../types/items";
import { ItemPriorityBadge } from "./item-priority-badge";
import { ItemStatusBadge } from "./item-status-badge";

type TrashRowProps = {
  item: Item;
};

function formatDeletedAgo(dateDeleted: string | null): string {
  if (!dateDeleted) return "";
  const deleted = new Date(dateDeleted);
  const now = new Date();
  const diffMs = now.getTime() - deleted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Deleted today";
  if (diffDays === 1) return "Deleted 1 day ago";
  return `Deleted ${diffDays} days ago`;
}

export function TrashRow({ item }: TrashRowProps) {
  const restoreItem = useRestoreItem();
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  const deletedText = formatDeletedAgo(item.dateDeleted);

  function handleRestore() {
    restoreItem.mutate(item.id);
  }

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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className={cn("truncate text-sm text-muted-foreground")}>{item.title}</span>
          <div className="flex shrink-0 items-center gap-1.5">
            <ItemStatusBadge status={item.status as ItemStatus} />
            <ItemPriorityBadge priority={item.priority as ItemPriority} />
          </div>
        </div>

        {deletedText && <span className="shrink-0 text-xs text-muted-foreground">{deletedText}</span>}

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
              <DropdownMenuItem onClick={handleRestore}>
                <ArrowCounterClockwiseIcon />
                Restore
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isMobile && expanded && (
        <div className="flex items-center gap-2 border-t px-3 py-2">
          <Button variant="ghost" size="sm" onClick={handleRestore}>
            <ArrowCounterClockwiseIcon />
            Restore
          </Button>
        </div>
      )}
    </div>
  );
}
