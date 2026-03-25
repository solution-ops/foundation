import { authClient } from "@foundation/ui/lib/auth-client";
import type { QueryConfig } from "@foundation/ui/lib/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { authKeys } from "../query-keys";

export async function fetchCurrentUser(): Promise<Awaited<ReturnType<typeof authClient.getSession>>> {
  const { data: session } = await authClient.getSession();
  return session;
}

export function fetchCurrentUserQueryOptions() {
  return queryOptions({
    queryKey: authKeys.currentUser(),
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}

type UseLoaderDataOptions = {
  queryConfig?: QueryConfig<typeof fetchCurrentUserQueryOptions>;
};

export function useCurrentUser({ queryConfig }: UseLoaderDataOptions = {}) {
  return useQuery({
    ...fetchCurrentUserQueryOptions(),
    ...queryConfig,
  });
}
