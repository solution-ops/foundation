import { queryClient } from "@foundation/ui/components/provider";
import { authClient } from "@foundation/ui/lib/auth-client";
import { GearSixIcon, InfoIcon, SignOutIcon } from "@phosphor-icons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "../api/auth/current-user";
import { authKeys } from "../api/query-keys";

export const Route = createFileRoute("/_auth/more")({
  component: MorePage,
});

function MorePage() {
  const navigate = useNavigate();
  const { data: session } = useCurrentUser();

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
    <div className="space-y-1 p-4">
      {session?.user && (
        <div className="mb-4 flex items-center gap-3 px-3">
          {session.user.image && (
            <img src={session.user.image} alt={session.user.name} className="size-10 rounded-full bg-muted" />
          )}
          <div className="grid text-left leading-tight">
            <span className="truncate text-sm font-semibold">{session.user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{session.user.email}</span>
          </div>
        </div>
      )}

      <Link
        to="/settings/profile"
        className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-muted"
      >
        <GearSixIcon className="size-5 text-muted-foreground" />
        <span className="text-sm font-medium">Settings</span>
      </Link>

      <Link
        to="/about"
        className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-muted"
      >
        <InfoIcon className="size-5 text-muted-foreground" />
        <span className="text-sm font-medium">About</span>
      </Link>

      <hr className="my-2 border-border" />

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-destructive transition-colors hover:bg-destructive/10"
      >
        <SignOutIcon className="size-5" />
        <span className="text-sm font-medium">Sign out</span>
      </button>
    </div>
  );
}
