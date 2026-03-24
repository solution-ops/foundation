import { Button } from "@foundation/ui/components/button";
import { WarningCircleIcon } from "@phosphor-icons/react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

/**
 * Route-level error component for TanStack Router.
 *
 * Shown when a route loader or component throws. Unlike the global
 * ErrorBoundary, this keeps the layout intact (sidebar stays visible)
 * and gives the user Retry / Go home options without a full page reload.
 */
export function RouteError({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="rounded-full bg-destructive/10 p-3">
        <WarningCircleIcon className="size-6 text-destructive" weight="duotone" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
        <Button size="sm" render={<Link to="/dashboard" />}>
          Go home
        </Button>
      </div>
    </div>
  );
}
