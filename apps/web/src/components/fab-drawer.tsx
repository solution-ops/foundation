import {
  FolderSimplePlusIcon,
  GearSixIcon,
  ListPlusIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@foundation/ui/components/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@foundation/ui/components/drawer";
import { useState } from "react";
import { openCommandPalette } from "../hooks/use-command-palette";
import { triggerNewTask } from "../hooks/use-quick-actions";
import { CreateCategoryDialog } from "./categories/create-category-dialog";

export function FABDrawer() {
  const [open, setOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const navigate = useNavigate();

  function handleClose() {
    setOpen(false);
  }

  function handleAction(action: () => void) {
    handleClose();
    requestAnimationFrame(action);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick actions"
        className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95"
      >
        <PlusIcon className={`size-6 transition-transform duration-200 ${open ? "rotate-45" : ""}`} weight="bold" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Quick Actions</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-3 px-4 pb-4">
            {/* Primary action */}
            <Button className="w-full" onClick={() => handleAction(triggerNewTask)}>
              <ListPlusIcon className="size-5" />
              New Task
            </Button>

            {/* Secondary actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleAction(() => setCategoryDialogOpen(true))}
                className="flex flex-col items-center gap-1.5 rounded-lg py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FolderSimplePlusIcon className="size-6" />
                <span className="text-xs font-medium">Category</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction(() => openCommandPalette())}
                className="flex flex-col items-center gap-1.5 rounded-lg py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MagnifyingGlassIcon className="size-6" />
                <span className="text-xs font-medium">Search</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction(() => navigate({ to: "/trash" }))}
                className="flex flex-col items-center gap-1.5 rounded-lg py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <TrashIcon className="size-6" />
                <span className="text-xs font-medium">Trash</span>
              </button>
            </div>

            {/* Tertiary */}
            <button
              type="button"
              onClick={() => handleAction(() => navigate({ to: "/settings/profile" }))}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <GearSixIcon className="size-5" />
              <span>Settings</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <CreateCategoryDialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen} />
    </>
  );
}
