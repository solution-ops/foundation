import { CheckCircleIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@foundation/ui/components/button";

type ItemEmptyStateProps = {
  onNewItem: () => void;
};

export function ItemEmptyState({ onNewItem }: ItemEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <div className="rounded-full bg-muted p-3">
        <CheckCircleIcon className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium">No items yet</h3>
        <p className="text-sm text-muted-foreground">Get started by creating your first item.</p>
      </div>
      <Button size="sm" onClick={onNewItem}>
        <PlusIcon weight="bold" />
        New item
      </Button>
    </div>
  );
}
