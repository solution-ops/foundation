import { useCallback, useEffect, useState } from "react";

const OPEN_EVENT = "foundation:command-palette-open";

/** Imperatively open the command palette from anywhere. */
export function openCommandPalette() {
  document.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener(OPEN_EVENT, handleOpen);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener(OPEN_EVENT, handleOpen);
    };
  }, [handleOpen]);

  return { open, setOpen };
}
