import { queryOptions } from "@tanstack/react-query";
import { fetchRunningHeatmap } from "@/services/api/heatmap";

/**
 * Aggregatet dekker alle år og endrer seg bare når det kommer en ny tur, så én
 * ny tur flytter knapt en celle. Lang staleTime er derfor riktig: dette er den
 * tyngste responsen på siden, og det er ingenting å vinne på å hente den ofte.
 */
export const RUNNING_HEATMAP_STALE_TIME = 60 * 60 * 1000;

export const runningHeatmapQueryOptions = () =>
  queryOptions({
    queryKey: ["running", "heatmap"] as const,
    queryFn: ({ signal }) => fetchRunningHeatmap(signal),
    staleTime: RUNNING_HEATMAP_STALE_TIME,
  });
