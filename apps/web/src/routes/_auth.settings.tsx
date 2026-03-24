import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@foundation/ui/components/select";
import { useIsMobile } from "@foundation/ui/hooks/use-mobile";
import { cn } from "@foundation/ui/utils/cn";
import type { Icon } from "@phosphor-icons/react";
import { PaintBrushIcon, UserIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/settings")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/settings" || location.pathname === "/settings/") {
      throw redirect({ to: "/settings/profile" });
    }
  },
  component: SettingsLayout,
});

type SettingsNavItem = {
  label: string;
  to: string;
  icon: Icon;
};

const navItems: Array<SettingsNavItem> = [
  { label: "Profile", to: "/settings/profile", icon: UserIcon },
  { label: "Preferences", to: "/settings/preferences", icon: PaintBrushIcon },
];

function SettingsLayout() {
  const isMobile = useIsMobile();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {isMobile ? <MobileNav /> : <DesktopLayout />}
    </div>
  );
}

function MobileNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = navItems.find((item) => pathname.startsWith(item.to));

  return (
    <>
      <Select
        value={current?.to ?? navItems[0].to}
        onValueChange={(value) => {
          if (value) navigate({ to: value });
        }}
      >
        <SelectTrigger aria-label="Settings section">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {navItems.map((item) => (
            <SelectItem key={item.to} value={item.to}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Outlet />
    </>
  );
}

function DesktopLayout() {
  return (
    <div className="flex gap-8">
      <nav className="w-48 shrink-0">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeProps={{ "data-active": true }}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
                  "data-[active=true]:bg-muted data-[active=true]:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
