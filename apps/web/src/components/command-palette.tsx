import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@foundation/ui/components/command";
import { GearSixIcon, ListChecksIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { triggerNewItem } from "../hooks/use-quick-actions";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  function runCommand(command: () => void) {
    onOpenChange(false);
    requestAnimationFrame(command);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(triggerNewItem)}>
            <PlusIcon className="size-4" />
            <span>New Item</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate({ to: "/dashboard" }))}>
            <ListChecksIcon className="size-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate({ to: "/trash" }))}>
            <TrashIcon className="size-4" />
            <span>Trash</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate({ to: "/settings/profile" }))}>
            <GearSixIcon className="size-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
