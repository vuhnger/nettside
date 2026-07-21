import { useQuery } from "@tanstack/react-query";
import { fetchCodingStats, fetchRunningStats } from "@/services/api/stats";

const statsKeys = {
  all: ["stats"] as const,
  running: (year: number) => [...statsKeys.all, "running", year] as const,
  coding: () => [...statsKeys.all, "coding"] as const,
};

const STATS_STALE_TIME = 15 * 60 * 1000;

export function useRunningStats(year: number) {
  return useQuery({
    queryKey: statsKeys.running(year),
    queryFn: ({ signal }) => fetchRunningStats(year, signal),
    staleTime: STATS_STALE_TIME,
  });
}

export function useCodingStats() {
  return useQuery({
    queryKey: statsKeys.coding(),
    queryFn: ({ signal }) => fetchCodingStats(signal),
    staleTime: STATS_STALE_TIME,
  });
}
