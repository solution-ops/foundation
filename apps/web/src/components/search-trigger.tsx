import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { cn } from "@foundation/ui/utils/cn";

type SearchTriggerProps = {
  onClick: () => void;
  className?: string;
};

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-56 items-center gap-2 rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted",
        className,
      )}
    >
      <MagnifyingGlassIcon className="size-4" />
      <span className="flex-1 text-left">Search...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        {isMac ? <span className="text-xs">⌘</span> : <span className="text-xs">Ctrl</span>}K
      </kbd>
    </button>
  );
}
