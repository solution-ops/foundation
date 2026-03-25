import { appConfig } from "@foundation/constants/app-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@foundation/ui/components/dropdown-menu";
import { queryClient } from "@foundation/ui/components/provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@foundation/ui/components/sidebar";
import { useTheme } from "@foundation/ui/hooks/use-theme";
import { authClient } from "@foundation/ui/lib/auth-client";
import {
  CaretUpDownIcon,
  GearSixIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SignOutIcon,
  SunIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link, Outlet, redirect, useLocation, useMatchRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";

import { fetchCurrentUserQueryOptions, useCurrentUser } from "../api/auth/current-user";
import { authKeys } from "../api/query-keys";
import { BottomTabBar } from "../components/bottom-tab-bar";
import { SidebarCategories } from "../components/categories/sidebar-categories";
import { CommandPalette } from "../components/command-palette";
import { SearchTrigger } from "../components/search-trigger";
import type { NavItem } from "../config/nav";
import { navGroups } from "../config/nav";
import { useCommandPalette } from "../hooks/use-command-palette";
import { useOnlineStatus } from "../hooks/use-online-status";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ location }) => {
    const session = await queryClient.fetchQuery(fetchCurrentUserQueryOptions());
    if (!session) {
      throw redirect({
        to: "/sign-up",
        search: {
          redirect: location.pathname,
        },
      });
    }
  },
  component: AuthLayout,
});

function SidebarNavItem({ item }: { item: NavItem }) {
  const matchRoute = useMatchRoute();
  const isActive = !!matchRoute({ to: item.to, fuzzy: true });

  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<Link to={item.to} activeProps={{ "data-active": true }} />} tooltip={item.title}>
        <item.icon weight={isActive ? "fill" : "regular"} />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function AuthLayout() {
  return (
    <SidebarProvider>
      <AuthLayoutContent />
    </SidebarProvider>
  );
}

function AuthLayoutContent() {
  const { navigate } = useRouter();
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();
  const { data: session } = useCurrentUser();
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const headerRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useOnlineStatus();

  // Close the mobile sidebar sheet when the route changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  // Add scroll shadow to desktop header via data attribute (no re-renders)
  const handleScroll = useCallback(() => {
    const header = headerRef.current;
    const scrollEl = scrollRef.current;
    if (!header || !scrollEl) return;
    header.toggleAttribute("data-scrolled", scrollEl.scrollTop > 0);
  }, []);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;
    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  async function handleLogout() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
          await navigate({ to: "/sign-in" });
        },
      },
    });
  }

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link to="/dashboard" />}>
                <img src="/favicon.svg" alt="" className="size-8 rounded-md" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{appConfig.name}</span>
                  <span className="truncate text-xs text-muted-foreground">v{appConfig.version}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarNavItem key={item.title} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}

          <SidebarCategories />
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <UserMenu
                name={session?.user?.name ?? "User"}
                email={session?.user?.email ?? ""}
                image={session?.user?.image ?? ""}
                onLogout={handleLogout}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Mobile header */}
        <header className="flex shrink-0 items-center justify-between border-b px-4 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] min-h-[calc(3rem+env(safe-area-inset-top))] md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/favicon.svg" alt="" className="size-6 rounded" />
            <span className="text-sm font-semibold">{appConfig.name}</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full text-muted-foreground"
              onClick={() => setCommandOpen(true)}
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="size-5" />
            </button>
            <MobileUserMenu
              name={session?.user?.name ?? "User"}
              email={session?.user?.email ?? ""}
              image={session?.user?.image ?? ""}
              onLogout={handleLogout}
            />
          </div>
        </header>
        {/* Desktop header */}
        <header
          ref={headerRef}
          className="sticky top-0 z-30 hidden h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur-sm transition-shadow data-scrolled:shadow-sm md:flex"
        >
          <SidebarTrigger className="-ml-1" />
          <SearchTrigger onClick={() => setCommandOpen(true)} className="ml-auto" />
        </header>
        <main
          ref={scrollRef}
          className="flex-1 overflow-auto md:overscroll-contain px-4 py-6 pb-20 sm:px-6 sm:pt-6 md:pb-6"
        >
          <Outlet />
        </main>
      </SidebarInset>

      <BottomTabBar />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}

type UserMenuProps = {
  name: string;
  email: string;
  image: string;
  onLogout: () => void;
};

function UserMenuContent({ name, email, image, onLogout }: UserMenuProps) {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
        <img src={image} alt={name} className="size-8 shrink-0 rounded-full bg-muted" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{name}</span>
          <span className="truncate text-xs text-muted-foreground">{email}</span>
        </div>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem render={<Link to="/settings/profile" />}>
          <GearSixIcon className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          {theme === "dark" ? <MoonIcon className="mr-2 size-4" /> : <SunIcon className="mr-2 size-4" />}
          Theme
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onLogout}>
        <SignOutIcon className="mr-2 size-4" />
        Sign out
      </DropdownMenuItem>
    </>
  );
}

function UserMenu(props: UserMenuProps) {
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton size="lg" />}>
        <img src={props.image} alt={props.name} className="size-8 shrink-0 rounded-full bg-muted" />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{props.name}</span>
          <span className="truncate text-xs text-muted-foreground">{props.email}</span>
        </div>
        <CaretUpDownIcon className="ml-auto size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <UserMenuContent {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileUserMenu(props: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full"
            aria-label="User menu"
          />
        }
      >
        <img src={props.image} alt={props.name} className="size-7 rounded-full bg-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <UserMenuContent {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
