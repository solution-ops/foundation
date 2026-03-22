import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@foundation/ui/components/dialog";
import { useAppForm } from "@foundation/ui/components/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@foundation/ui/components/tabs";
import { useListCategories } from "../../api/categories/list-categories";
import { useCreateItem } from "../../api/items/create-item";
import { useUpdateItem } from "../../api/items/update-item";
import type { CreateItemInput, Item, ItemPriority, ItemStatus } from "../../types/items";
import { itemPriorityValues, itemStatusValues } from "../../types/items";
import { ItemActivityFeed } from "./item-activity-feed";

type ItemFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: Item | null;
};

const statusOptions = itemStatusValues.map((s) => ({
  value: s,
  label: s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1),
}));

const priorityOptions = itemPriorityValues.map((p) => ({
  value: p,
  label: p.charAt(0).toUpperCase() + p.slice(1),
}));

export function ItemFormDialog({ open, onOpenChange, item }: ItemFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        {open && <ItemFormContent item={item} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ItemForm({ item, onClose }: { item?: Item | null; onClose: () => void }) {
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const { data: categoriesData } = useListCategories();
  const isEditing = !!item;

  const categoryOptions = (categoriesData?.categories ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const form = useAppForm({
    defaultValues: {
      title: item?.title ?? "",
      description: item?.description ?? "",
      status: item?.status ?? "todo",
      priority: item?.priority ?? "none",
      dateDue: item?.dateDue ? new Date(item.dateDue).toISOString().split("T")[0] : "",
      categoryId: item?.categoryId ?? "",
    },
    onSubmit: async ({ value }) => {
      const payload: CreateItemInput = {
        title: value.title,
        description: value.description || undefined,
        status: value.status as ItemStatus,
        priority: value.priority as ItemPriority,
        dateDue: value.dateDue ? new Date(value.dateDue) : undefined,
        categoryId: value.categoryId || null,
      };

      if (isEditing && item) {
        await updateItem.mutateAsync({ id: item.id, data: payload });
      } else {
        await createItem.mutateAsync(payload);
      }
      onClose();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.AppForm>
        <form.AppField name="title">
          {({ TextField }) => <TextField label="Title" placeholder="What needs to be done?" />}
        </form.AppField>

        <form.AppField name="description">
          {({ TextareaField }) => <TextareaField label="Description" placeholder="Add details..." rows={3} />}
        </form.AppField>

        <div className="grid grid-cols-2 gap-3">
          <form.AppField name="status">
            {({ SelectField }) => <SelectField label="Status" options={statusOptions} placeholder="Select status" />}
          </form.AppField>

          <form.AppField name="priority">
            {({ SelectField }) => (
              <SelectField label="Priority" options={priorityOptions} placeholder="Select priority" />
            )}
          </form.AppField>
        </div>

        {categoryOptions.length > 0 && (
          <form.AppField name="categoryId">
            {({ SelectField }) => (
              <SelectField
                label="Category"
                options={[{ value: "", label: "No category" }, ...categoryOptions]}
                placeholder="Select category"
              />
            )}
          </form.AppField>
        )}

        <form.AppField name="dateDue">{({ TextField }) => <TextField label="Due date" type="date" />}</form.AppField>

        <div className="flex justify-end gap-2 pt-2">
          <form.SubmitButton label={isEditing ? "Save changes" : "Create item"} />
        </div>
      </form.AppForm>
    </form>
  );
}

function ItemFormContent({ item, onClose }: { item?: Item | null; onClose: () => void }) {
  const isEditing = !!item;

  if (!isEditing) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
          <DialogDescription>Add a new item to your list.</DialogDescription>
        </DialogHeader>
        <ItemForm item={item} onClose={onClose} />
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit item</DialogTitle>
        <DialogDescription>Update the item details or view activity history.</DialogDescription>
      </DialogHeader>

      <Tabs defaultValue="details">
        <TabsList variant="line" className="w-full">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details" keepMounted>
          <ItemForm item={item} onClose={onClose} />
        </TabsContent>

        <TabsContent value="activity">
          <ItemActivityFeed itemId={item.id} />
        </TabsContent>
      </Tabs>
    </>
  );
}
