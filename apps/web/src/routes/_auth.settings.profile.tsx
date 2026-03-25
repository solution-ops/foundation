import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@foundation/ui/components/alert-dialog";
import { Button } from "@foundation/ui/components/button";
import { Input } from "@foundation/ui/components/input";
import { Label } from "@foundation/ui/components/label";
import { queryClient } from "@foundation/ui/components/provider";
import { authClient } from "@foundation/ui/lib/auth-client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCurrentUser } from "../api/auth/current-user";
import { authKeys } from "../api/query-keys";

export const Route = createFileRoute("/_auth/settings/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: session, isLoading } = useCurrentUser();

  if (isLoading || !session?.user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    );
  }

  const { user } = session;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Avatar</h2>
          <p className="text-sm text-muted-foreground">Your avatar is set by your sign-in provider.</p>
        </div>
        {user.image ? (
          <img src={user.image} alt={user.name} className="size-20 rounded-full bg-muted" />
        ) : (
          <div className="size-20 rounded-full bg-muted" aria-hidden="true" />
        )}
      </section>

      <hr className="border-border" />

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">Your account details.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Display name</Label>
            <Input id="display-name" value={user.name} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
            <p className="text-sm text-muted-foreground">Managed by your sign-in provider.</p>
          </div>
        </div>
      </section>

      <hr className="border-border" />

      <DeleteAccountSection />
    </div>
  );
}

function DeleteAccountSection() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  async function handleDelete() {
    setIsPending(true);
    setError(null);
    try {
      const { error: deleteError } = await authClient.deleteUser({
        ...(password ? { password } : {}),
      });
      if (deleteError) {
        setError(deleteError.message ?? "Failed to delete account. Please try again.");
      } else {
        await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
        setOpen(false);
        await navigate({ to: "/" });
      }
    } finally {
      setIsPending(false);
    }
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      setPassword("");
      setError(null);
    }
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-destructive">Delete Account</h2>
        <p className="text-sm text-muted-foreground">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
      </div>
      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>Delete account</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account, items, categories, and all other data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Enter your password to confirm</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="current-password"
              placeholder="Required for email/password accounts"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete my account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
