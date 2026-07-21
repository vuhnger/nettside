import { useQuery } from "@tanstack/react-query";
import { fetchApiStatus } from "@/services/api/client";

export function useApiStatus() {
  return useQuery({
    queryKey: ["api-status"],
    queryFn: ({ signal }) => fetchApiStatus(signal),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}
