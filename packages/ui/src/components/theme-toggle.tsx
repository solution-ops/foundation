import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { useTheme } from "../hooks/use-theme";
import { Button } from "./button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <SunIcon className="h-[1.5rem] w-[1.3rem] dark:hidden" />
      <MoonIcon className="hidden h-5 w-5 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
