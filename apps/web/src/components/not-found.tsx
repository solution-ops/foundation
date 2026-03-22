import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@foundation/ui/components/button";

/**
 * Not-found component for TanStack Router.
 *
 * Displayed when no route matches the current URL.
 */
export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="rounded-full bg-muted p-3">
        <MagnifyingGlassIcon className="size-6 text-muted-foreground" weight="duotone" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Page not found</h2>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Button size="sm" render={<Link to="/dashboard" />}>
        Go home
      </Button>
    </div>
  );
}
