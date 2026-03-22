import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@foundation/ui/components/dialog";
import { useAppForm, useFieldContext, useFormItemId } from "@foundation/ui/components/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundation/ui/components/select";
import { useCreateCategory } from "../../api/categories/create-category";
import { type CategoryColor, categoryColorValues } from "../../types/categories";
import { CategoryColorDot } from "./category-color-dot";

type CreateCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const colorOptions = categoryColorValues.map((c) => ({
  value: c,
  label: c.charAt(0).toUpperCase() + c.slice(1),
}));

function ColorSelect() {
  const field = useFieldContext<string>();
  const id = useFormItemId();

  return (
    <Select
      value={field.state.value}
      onValueChange={(value) => field.handleChange(value ?? "")}
      items={Object.fromEntries(colorOptions.map((o) => [o.value, o.label]))}
    >
      <SelectTrigger id={`${id}-form-item`}>
        <SelectValue placeholder="Select a color" />
      </SelectTrigger>
      <SelectContent>
        {colorOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-1.5">
              <CategoryColorDot color={option.value as CategoryColor} />
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CreateCategoryDialog({ open, onOpenChange }: CreateCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {open && <CreateCategoryForm onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function CreateCategoryForm({ onClose }: { onClose: () => void }) {
  const createCategory = useCreateCategory();

  const form = useAppForm({
    defaultValues: {
      name: "",
      color: "blue" as string,
    },
    onSubmit: async ({ value }) => {
      await createCategory.mutateAsync({
        name: value.name.trim(),
        color: value.color as CategoryColor,
      });
      onClose();
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add category</DialogTitle>
        <DialogDescription>Create a new category to organize your tasks.</DialogDescription>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <form.AppForm>
          <form.AppField name="name">
            {({ TextField }) => <TextField label="Name" placeholder="e.g., Work, Personal..." autoFocus />}
          </form.AppField>

          <form.AppField name="color">
            {({ FormItem, FormLabel, FormControl, FormMessage }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <ColorSelect />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </form.AppField>

          <div className="flex justify-end gap-2 pt-2">
            <form.SubmitButton label="Create" />
          </div>
        </form.AppForm>
      </form>
    </>
  );
}
