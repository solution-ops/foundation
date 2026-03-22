import { cn } from "@foundation/ui/utils/cn";
import { type CategoryColor, categoryColorValues } from "../../types/categories";
import { colorClasses } from "./category-color-dot";

type CategoryColorPickerProps = {
  currentColor: CategoryColor;
  onColorChange: (color: CategoryColor) => void;
};

export function CategoryColorPicker({ currentColor, onColorChange }: CategoryColorPickerProps) {
  return (
    <div className="grid grid-cols-5 gap-1.5 p-2">
      {categoryColorValues.map((color) => {
        const isSelected = color === currentColor;
        const classes = colorClasses[color] ?? colorClasses.blue;

        return (
          <button
            key={color}
            type="button"
            className={cn(
              "flex size-5 items-center justify-center rounded-full transition-transform hover:scale-110",
              classes.dot,
              isSelected && "ring-2 ring-foreground ring-offset-2 ring-offset-popover",
            )}
            onClick={() => onColorChange(color)}
            aria-label={color}
            title={color.charAt(0).toUpperCase() + color.slice(1)}
          />
        );
      })}
    </div>
  );
}
