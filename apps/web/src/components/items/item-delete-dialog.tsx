import { Button } from "@foundation/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@foundation/ui/components/dialog";
import { useDeleteItem } from "../../api/items/delete-item";
import type { Item } from "../../types/items";

type ItemDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
};

export function ItemDeleteDialog({ open, onOpenChange, item }: ItemDeleteDialogProps) {
  const deleteItem = useDeleteItem();

  async function handleDelete() {
    if (!item) return;
    await deleteItem.mutateAsync(item.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Move to trash</DialogTitle>
          <DialogDescription>
            Are you sure you want to move <span className="font-medium">"{item?.title}"</span> to the trash? It will be
            permanently removed after 30 days.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteItem.isPending}>
            {deleteItem.isPending ? "Moving..." : "Move to trash"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
