import { queryOptions } from "@tanstack/react-query";
import {
  fetchCodingStats,
  fetchRunningActivities,
  fetchRunningDistance,
} from "@/services/api/stats";

export const STATS_STALE_TIME = 10 * 60 * 1000;

export const runningDistanceQueryOptions = () =>
  queryOptions({
    queryKey: ["stats", "running", "distance"] as const,
    queryFn: ({ signal }) => fetchRunningDistance(signal),
    staleTime: STATS_STALE_TIME,
  });

export const runningActivitiesQueryOptions = (year: number) =>
  queryOptions({
    queryKey: ["stats", "running", "activities", year] as const,
    queryFn: ({ signal }) => fetchRunningActivities(year, signal),
    staleTime: STATS_STALE_TIME,
  });

export const codingStatsQueryOptions = () =>
  queryOptions({
    queryKey: ["stats", "coding"] as const,
    queryFn: ({ signal }) => fetchCodingStats(signal),
    staleTime: STATS_STALE_TIME,
  });
