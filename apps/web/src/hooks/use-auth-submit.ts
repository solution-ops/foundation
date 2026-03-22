import { useRouter, useSearch } from "@tanstack/react-router";
import { queryClient } from "@foundation/ui/components/provider";
import { authClient } from "@foundation/ui/lib/auth-client";
import { ensureError } from "@foundation/utils/common/ensure-error";
import { useState } from "react";
import { toast } from "sonner";
import { fetchCurrentUserQueryOptions } from "../api/auth/current-user";
import { authKeys } from "../api/query-keys";

type AuthType = "sign-in" | "sign-up";
type AuthFormValues = { username?: string; password: string; email: string };
type SocialProvider = "google" | "github" | "discord";

export const fallbackRoute = "/dashboard" as const;

/**
 * Ensures redirect targets are relative paths to prevent open-redirect attacks.
 * Exported so route-level validateSearch transforms can share the same logic.
 */
export function sanitizeRedirect(redirect: string | undefined): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return fallbackRoute;
  }
  return redirect;
}

/**
 * Hook that handles both email/password and social authentication flows.
 *
 * Returns an object with:
 * - handleEmailAuth: Function for email/password authentication
 * - handleSocialAuth: Function for social authentication (Google, GitHub, Discord)
 *
 * Both functions handle:
 * - Consistent error handling and toast notifications
 * - Navigation to redirect URL or fallback route
 * - Session invalidation and refresh
 */
export function useAuthSubmit(type: AuthType) {
  const { navigate } = useRouter();
  const search = useSearch({ from: type === "sign-in" ? "/sign-in" : "/sign-up" });
  const { signUp, signIn } = authClient;
  const [isLoading, setIsLoading] = useState(false);

  async function handleEmailAuth({ email, password, username }: AuthFormValues) {
    const redirectTo = sanitizeRedirect(search.redirect);

    try {
      const onError = handleProviderError;
      async function onSuccess() {
        // Invalidate cached session then wait for fresh data before navigating.
        // This prevents the _auth route guard from seeing stale/null session data.
        await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
        await queryClient.ensureQueryData(fetchCurrentUserQueryOptions());
        await navigate({ to: redirectTo });
      }

      if (type === "sign-up") {
        if (!email) throw new Error("Email is required to sign up.");
        if (!username) throw new Error("Username is required to sign up.");
        await signUp.email(
          { email, password, name: username },
          {
            onSuccess,
            onError,
            onRequest: () => setIsLoading(true),
            onResponse: () => setIsLoading(false),
          },
        );
        return;
      }

      if (!email) throw new Error("Email is required to sign in.");
      await signIn.email(
        { email, password },
        {
          onSuccess,
          onError,
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
        },
      );
    } catch (error) {
      setIsLoading(false);
      showErrorToast(error);
    }
  }

  async function handleSocialAuth(provider: SocialProvider) {
    const redirectTo = sanitizeRedirect(search.redirect);

    try {
      await signIn.social(
        { provider, callbackURL: redirectTo },
        {
          onError: handleProviderError,
          onRequest: () => setIsLoading(true),
          onResponse: () => setIsLoading(false),
        },
      );
    } catch (error) {
      setIsLoading(false);
      showErrorToast(error);
    }
  }

  return {
    handleEmailAuth,
    handleSocialAuth,
    isLoading,
  };
}

function handleProviderError(context: { error?: { code?: string; name?: string; message?: string } }) {
  const error = context?.error;
  const title = error?.code || error?.name || "Authentication error";
  const description = error?.message || "Something went wrong";
  toast.error(title, { description });
}

function showErrorToast(error: unknown) {
  const ensuredError = ensureError(error);
  toast.error(ensuredError.name, { description: ensuredError.message });
}
