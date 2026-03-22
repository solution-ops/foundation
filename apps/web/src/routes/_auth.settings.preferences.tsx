import { DesktopIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { ToggleGroup, ToggleGroupItem } from "@foundation/ui/components/toggle-group";
import { useTheme } from "@foundation/ui/hooks/use-theme";

export const Route = createFileRoute("/_auth/settings/preferences")({
  component: PreferencesPage,
});

function PreferencesPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Theme</h2>
          <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
        </div>
        <ToggleGroup
          variant="outline"
          value={[theme]}
          onValueChange={(values) => {
            if (values.length > 0) setTheme(values[0] as "light" | "dark" | "system");
          }}
        >
          <ToggleGroupItem value="light">
            <SunIcon className="size-4" /> Light
          </ToggleGroupItem>
          <ToggleGroupItem value="dark">
            <MoonIcon className="size-4" /> Dark
          </ToggleGroupItem>
          <ToggleGroupItem value="system">
            <DesktopIcon className="size-4" /> System
          </ToggleGroupItem>
        </ToggleGroup>
      </section>
    </div>
  );
}
