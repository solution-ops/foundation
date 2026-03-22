import { Button } from "@foundation/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@foundation/ui/components/dialog";
import { useDeleteCategory } from "../../api/categories/delete-category";
import type { CategoryItem } from "../../api/categories/list-categories";

type DeleteCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryItem | null;
};

export function DeleteCategoryDialog({ open, onOpenChange, category }: DeleteCategoryDialogProps) {
  const deleteCategory = useDeleteCategory();

  async function handleDelete() {
    if (!category) return;
    await deleteCategory.mutateAsync(category.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-medium">"{category?.name}"</span>? Tasks in this
            category will be uncategorized, not deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteCategory.isPending}>
            {deleteCategory.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
