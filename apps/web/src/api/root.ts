import type { HealthResponse } from "@foundation/types/health";
import type { QueryConfig } from "@foundation/ui/lib/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

export async function fetchRoot(): Promise<HealthResponse> {
  const res = await fetch("/api");
  return res.json();
}

export const fetchRootQueryOptions = () => {
  return queryOptions({
    queryKey: ["root"],
    queryFn: fetchRoot,
  });
};

type UseRootOptions = {
  queryConfig?: QueryConfig<typeof fetchRootQueryOptions>;
};

export const useRoot = ({ queryConfig }: UseRootOptions = {}) => {
  return useQuery({
    ...fetchRootQueryOptions(),
    ...queryConfig,
  });
};
