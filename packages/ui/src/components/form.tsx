import { createId } from "@paralleldrive/cuid2";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { VariantProps } from "class-variance-authority";
import {
  type ComponentProps,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type PropsWithChildren,
  useContext,
  useId,
} from "react";
import { cn } from "../utils/cn";
import { Button, type buttonVariants } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Textarea } from "./textarea";

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

type FormItemContextValue = {
  id: string;
};

const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-1.5", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = forwardRef<HTMLLabelElement, ComponentProps<"label">>(({ className, ...props }, ref) => {
  const field = useFieldContext();
  const { id } = useContext(FormItemContext);

  return (
    <Label
      ref={ref}
      className={cn(field.state.meta.errors.length && "text-destructive", className)}
      htmlFor={`${id}-form-item`}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

function useFormItemId() {
  const { id } = useContext(FormItemContext);
  return id;
}

function FormControl({ children }: PropsWithChildren) {
  return <>{children}</>;
}

const FormDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { id } = useContext(FormItemContext);

    return (
      <p
        ref={ref}
        id={`${id}-form-item-description`}
        className={cn("text-[0.8rem] text-muted-foreground", className)}
        {...props}
      />
    );
  },
);
FormDescription.displayName = "FormDescription";

const FormMessage = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const field = useFieldContext();
    const { id } = useContext(FormItemContext);

    if (field.state.meta.errors?.length) {
      return (
        <div id={`${id}-form-item-message`} className={cn("space-y-1", className)} {...props}>
          {field.state.meta.errors.map((error) => (
            <p key={`${id}-error-${createId()}`} className={cn("text-[0.8rem] font-medium text-destructive")}>
              {error.message}
            </p>
          ))}
        </div>
      );
    }

    if (children) {
      return (
        <p
          ref={ref}
          id={`${id}-form-item-message`}
          className={cn("text-[0.8rem] font-medium text-destructive", className)}
          {...props}
        >
          {children}
        </p>
      );
    }

    return null;
  },
);
FormMessage.displayName = "FormMessage";

// Inner component that has access to FormItemContext provided by FormItem
function TextFieldInner({
  label,
  description,
  ...props
}: { label?: string; description?: string } & ComponentProps<"input">) {
  const field = useFieldContext<string>();
  const id = useFormItemId();

  return (
    <>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <Input
          id={`${id}-form-item`}
          aria-describedby={
            !field.state.meta.errors.length
              ? `${id}-form-item-description`
              : `${id}-form-item-description ${id}-form-item-message`
          }
          aria-invalid={!!field.state.meta.errors.length}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          {...props}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </>
  );
}

// Pre-bound field components
function TextField(props: { label?: string; description?: string } & ComponentProps<"input">) {
  return (
    <FormItem>
      <TextFieldInner {...props} />
    </FormItem>
  );
}

// Inner component that has access to FormItemContext provided by FormItem
function TextareaFieldInner({
  label,
  description,
  ...props
}: { label?: string; description?: string } & ComponentProps<"textarea">) {
  const field = useFieldContext<string>();
  const id = useFormItemId();

  return (
    <>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <Textarea
          id={`${id}-form-item`}
          aria-describedby={
            !field.state.meta.errors.length
              ? `${id}-form-item-description`
              : `${id}-form-item-description ${id}-form-item-message`
          }
          aria-invalid={!!field.state.meta.errors.length}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          {...props}
        />
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </>
  );
}

// Pre-bound textarea field component
function TextareaField(props: { label?: string; description?: string } & ComponentProps<"textarea">) {
  return (
    <FormItem>
      <TextareaFieldInner {...props} />
    </FormItem>
  );
}

type SelectFieldOption = {
  label: string;
  value: string;
};

// Inner component that has access to FormItemContext provided by FormItem
function SelectFieldInner({
  label,
  description,
  options,
  placeholder,
}: {
  label?: string;
  description?: string;
  options: Array<SelectFieldOption>;
  placeholder?: string;
}) {
  const field = useFieldContext<string>();
  const id = useFormItemId();

  return (
    <>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <Select
          value={field.state.value}
          onValueChange={(value) => field.handleChange(value ?? "")}
          items={Object.fromEntries(options.map((o) => [o.value, o.label]))}
        >
          <SelectTrigger
            id={`${id}-form-item`}
            aria-describedby={
              !field.state.meta.errors.length
                ? `${id}-form-item-description`
                : `${id}-form-item-description ${id}-form-item-message`
            }
            aria-invalid={!!field.state.meta.errors.length}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </>
  );
}

// Pre-bound select field component
function SelectField(props: {
  label?: string;
  description?: string;
  options: Array<SelectFieldOption>;
  placeholder?: string;
}) {
  return (
    <FormItem>
      <SelectFieldInner {...props} />
    </FormItem>
  );
}

type SubmitButtonProps = {
  label: string;
} & ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

function SubmitButton({ label, className, variant, size, ...props }: SubmitButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={cn(className)}
          variant={variant}
          size={size}
          {...props}
        >
          {isSubmitting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            label
          )}
        </Button>
      )}
    </form.Subscribe>
  );
}

// Create the form hook with pre-bound components
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    TextareaField,
    SelectField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
  },
  formComponents: {
    SubmitButton,
  },
});

// Export components for standalone use
export {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  TextField,
  TextareaField,
  SelectField,
  SubmitButton,
  useFormItemId,
  type SelectFieldOption,
};
