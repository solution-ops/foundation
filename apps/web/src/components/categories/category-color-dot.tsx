import { cn } from "@foundation/ui/utils/cn";
import type { CategoryColor } from "../../types/categories";

/**
 * Static color class map — avoids Tailwind purging dynamic template-literal classes.
 * Each color maps to a dot background class and a faded background class.
 */
const colorClasses: Record<CategoryColor, { dot: string; bg: string }> = {
  red: { dot: "bg-red-500", bg: "bg-red-500/10" },
  orange: { dot: "bg-orange-500", bg: "bg-orange-500/10" },
  amber: { dot: "bg-amber-500", bg: "bg-amber-500/10" },
  yellow: { dot: "bg-yellow-500", bg: "bg-yellow-500/10" },
  lime: { dot: "bg-lime-500", bg: "bg-lime-500/10" },
  green: { dot: "bg-green-500", bg: "bg-green-500/10" },
  emerald: { dot: "bg-emerald-500", bg: "bg-emerald-500/10" },
  teal: { dot: "bg-teal-500", bg: "bg-teal-500/10" },
  cyan: { dot: "bg-cyan-500", bg: "bg-cyan-500/10" },
  sky: { dot: "bg-sky-500", bg: "bg-sky-500/10" },
  blue: { dot: "bg-blue-500", bg: "bg-blue-500/10" },
  indigo: { dot: "bg-indigo-500", bg: "bg-indigo-500/10" },
  violet: { dot: "bg-violet-500", bg: "bg-violet-500/10" },
  purple: { dot: "bg-purple-500", bg: "bg-purple-500/10" },
  fuchsia: { dot: "bg-fuchsia-500", bg: "bg-fuchsia-500/10" },
  pink: { dot: "bg-pink-500", bg: "bg-pink-500/10" },
  rose: { dot: "bg-rose-500", bg: "bg-rose-500/10" },
};

type CategoryColorDotProps = {
  color: CategoryColor;
  className?: string;
};

export function CategoryColorDot({ color, className }: CategoryColorDotProps) {
  const classes = colorClasses[color] ?? colorClasses.blue;
  return <span className={cn("inline-block size-2.5 shrink-0 rounded-full", classes.dot, className)} />;
}

export { colorClasses };
