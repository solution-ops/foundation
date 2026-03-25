import { ErrorBoundary } from "@foundation/ui/components/error-boundary";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <ErrorBoundary>
      <Outlet />
      <TanStackRouterDevtools />
    </ErrorBoundary>
  ),
});
