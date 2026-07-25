import { createQueryClient } from "@/lib/query-client";
import HeatmapTeaser from "./HeatmapTeaser";
import { runningHeatmapQueryOptions } from "./queries";

/**
 * Teaseren er ren serverrendering: den er et bilde uten interaksjon, så
 * ingenting av dette trenger å følge med til nettleseren.
 *
 * Feiler kallet, faller kortet bort. Forsiden har ingen nytte av et varmekart
 * uten kart, og et halvtomt kort ville sett ut som en feil framfor et valg.
 */
const loadHeatmap = async () => {
  const queryClient = createQueryClient(false);

  try {
    return await queryClient.fetchQuery(runningHeatmapQueryOptions());
  } catch {
    return null;
  }
};

const PrefetchedHeatmapTeaser = async () => {
  const heatmap = await loadHeatmap();
  if (!heatmap || heatmap.cells.length === 0) return null;

  return <HeatmapTeaser heatmap={heatmap} />;
};

export default PrefetchedHeatmapTeaser;
