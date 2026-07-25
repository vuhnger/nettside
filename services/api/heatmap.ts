import { z } from "zod";
import { fetchApi } from "./client";

/**
 * Backend aggregerer GPS-punktene fra alle løpeturer server-side: hjemmeadressen
 * klippes bort, punktene rundes til et rutenett, og hver celle får et treffantall.
 * Vi mottar altså aldri enkeltspor — bare «hvor ofte har det blitt løpt her».
 *
 * Cellene kommer som kompakte tripler `[lon, lat, count]` framfor objekter. Med
 * titusenvis av celler er det forskjellen på ~120 kB og ~400 kB gzipet.
 */
const heatmapCellSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
  z.number().positive(),
]);

const runningHeatmapSchema = z.object({
  cell_size_m: z.number().positive(),
  bounds: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
  // Vi regner ut maksverdien selv fra cellene, så denne er kun informativ.
  max_count: z.number().positive().optional(),
  activity_count: z.number().nonnegative(),
  total_distance_m: z.number().nonnegative(),
  cells: z.array(heatmapCellSchema),
});

export type HeatmapCell = {
  lon: number;
  lat: number;
  count: number;
};

/** `[vest, sør, øst, nord]` — samme rekkefølge som MapLibres `LngLatBoundsLike`. */
export type HeatmapBounds = [number, number, number, number];

export type RunningHeatmap = {
  cellSizeM: number;
  bounds: HeatmapBounds;
  activityCount: number;
  totalDistanceM: number;
  cells: HeatmapCell[];
};

export async function fetchRunningHeatmap(signal?: AbortSignal): Promise<RunningHeatmap> {
  const response = await fetchApi(
    "/strava/heatmap?activity_type=Run",
    runningHeatmapSchema,
    signal,
  );

  return {
    cellSizeM: response.cell_size_m,
    bounds: response.bounds,
    activityCount: response.activity_count,
    totalDistanceM: response.total_distance_m,
    cells: response.cells.map(([lon, lat, count]) => ({ lon, lat, count })),
  };
}
