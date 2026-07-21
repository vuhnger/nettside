import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { fetchApi } from "@/services/api/client";

const apiHealthSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  database: z.string(),
});

export const apiStatusQueryOptions = () =>
  queryOptions({
    queryKey: ["api-status"] as const,
    queryFn: async ({ signal }) => {
      await fetchApi("/strava/health", apiHealthSchema, signal);
      return true;
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
