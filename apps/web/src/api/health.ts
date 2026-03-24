import type { HealthResponse } from "@foundation/types/health";
import type { QueryConfig } from "@foundation/ui/lib/react-query";
import { queryOptions, useQuery } from "@tanstack/react-query";

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch("/api/health");
  return res.json();
}

export const fetchHealthQueryOptions = () => {
  return queryOptions({
    queryKey: ["health"],
    queryFn: fetchHealth,
  });
};

type UseHealthOptions = {
  queryConfig?: QueryConfig<typeof fetchHealthQueryOptions>;
};

export const useHealth = ({ queryConfig }: UseHealthOptions = {}) => {
  return useQuery({
    ...fetchHealthQueryOptions(),
    ...queryConfig,
  });
};
