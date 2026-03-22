import type { Icon } from "@phosphor-icons/react";
import { BookOpenIcon, ChartLineIcon, DotsThreeIcon, TrashIcon } from "@phosphor-icons/react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { FABDrawer } from "./fab-drawer";

const tabs: Array<{ title: string; icon: Icon; to: string }> = [
  { title: "Dashboard", icon: ChartLineIcon, to: "/dashboard" },
  { title: "Trash", icon: TrashIcon, to: "/trash" },
  // FAB goes here (rendered separately)
  { title: "Library", icon: BookOpenIcon, to: "/library" },
  { title: "More", icon: DotsThreeIcon, to: "/more" },
];

function TabLink({ tab }: { tab: (typeof tabs)[number] }) {
  const matchRoute = useMatchRoute();
  const isActive = !!matchRoute({ to: tab.to, fuzzy: true });

  return (
    <Link
      to={tab.to}
      className="flex flex-1 flex-col items-center justify-center gap-0.5 text-muted-foreground transition-colors [&.active]:text-foreground"
      activeProps={{ className: "active", "aria-current": "page" }}
    >
      <tab.icon className="size-5" weight={isActive ? "fill" : "regular"} />
      <span className="text-xs font-medium">{tab.title}</span>
    </Link>
  );
}

export function BottomTabBar() {
  const leftTabs = tabs.slice(0, 2);
  const rightTabs = tabs.slice(2);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] md:hidden"
    >
      <div className="flex h-14 items-stretch">
        {leftTabs.map((tab) => (
          <TabLink key={tab.to} tab={tab} />
        ))}

        <div className="flex flex-1 items-center justify-center">
          <FABDrawer />
        </div>

        {rightTabs.map((tab) => (
          <TabLink key={tab.to} tab={tab} />
        ))}
      </div>
    </nav>
  );
}
