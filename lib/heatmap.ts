import type { HeatmapBounds, HeatmapCell } from "@/services/api/heatmap";

/**
 * Minimal GeoJSON-form. MapLibre tar imot hvilket som helst strukturelt likt
 * objekt, så vi slipper å dra inn en typepakke bare for disse fire feltene.
 */
export type HeatmapFeatureCollection = {
  type: "FeatureCollection";
  features: {
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: { weight: number };
  }[];
};

/**
 * En celle teller antall aktiviteter som har passert den, ikke antall
 * GPS-punkter. Backend valgte det bevisst: punkttetthet følger tempo, så rå
 * punkttelling ville framhevet der jeg løper saktest framfor der jeg løper ofte.
 *
 * Fordelingen er likevel skjev — en gjennomgangsgate treffes av titalls turer
 * mens en tur jeg løp én gang har 1 (målt: 27 av 108 turer i travleste celle).
 * Lineær normalisering ville gitt engangsturen vekt 0.04 og gjort kartet nesten
 * tomt. Logaritmisk skala gir 0.21 og holder dem synlige, samtidig som
 * gjentakelse fortsatt lyser sterkere.
 *
 * Kurven bør finjusteres mot ekte data når endepunktet er live. Den ligger
 * isolert her nettopp for at det skal være en énlinjes endring.
 */
export function normalizeWeight(count: number, maxCount: number): number {
  if (maxCount <= 1) return count > 0 ? 1 : 0;
  return Math.log1p(count) / Math.log1p(maxCount);
}

/**
 * Maksverdien regnes ut fra cellene i stedet for å stole på feltet backend
 * sender. Da kan en vekt aldri overstige 1 selv om de to skulle komme i utakt.
 */
export function maxCellCount(cells: readonly HeatmapCell[]): number {
  let max = 0;
  for (const cell of cells) {
    if (cell.count > max) max = cell.count;
  }
  return max;
}

export function toHeatmapGeoJson(cells: readonly HeatmapCell[]): HeatmapFeatureCollection {
  const maxCount = maxCellCount(cells);

  return {
    type: "FeatureCollection",
    features: cells.map((cell) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [cell.lon, cell.lat] },
      properties: { weight: normalizeWeight(cell.count, maxCount) },
    })),
  };
}

// Web Mercator er udefinert på polene, så vi klipper til projeksjonens vanlige grense.
const MAX_MERCATOR_LATITUDE = 85.051129;

const mercatorX = (lon: number): number => (lon + 180) / 360;

const mercatorY = (lat: number): number => {
  const clamped = Math.min(Math.max(lat, -MAX_MERCATOR_LATITUDE), MAX_MERCATOR_LATITUDE);
  const rad = (clamped * Math.PI) / 180;
  return (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2;
};

export type ProjectedCell = {
  x: number;
  y: number;
  weight: number;
};

/**
 * Projiserer cellene inn i et SVG-koordinatsystem for den statiske teaseren.
 * Samme Web Mercator-projeksjon som kartbiblioteket bruker, slik at teaseren og
 * det interaktive kartet viser nøyaktig samme form.
 *
 * Målforholdet bevares og innholdet sentreres — strekker vi bildet for å fylle
 * viewBoxen blir byen visuelt feil.
 */
export function projectCells(
  cells: readonly HeatmapCell[],
  bounds: HeatmapBounds,
  width: number,
  height: number,
): ProjectedCell[] {
  const [west, south, east, north] = bounds;
  const originX = mercatorX(west);
  const originY = mercatorY(north);
  const spanX = mercatorX(east) - originX;
  const spanY = mercatorY(south) - originY;

  // Ett enkelt punkt (eller en helt flat utstrekning) gir ingen skala å regne
  // fra. Da faller vi tilbake til den aksen som faktisk har utstrekning.
  const scaleX = spanX > 0 ? width / spanX : Number.POSITIVE_INFINITY;
  const scaleY = spanY > 0 ? height / spanY : Number.POSITIVE_INFINITY;
  const scale = Math.min(scaleX, scaleY);
  const safeScale = Number.isFinite(scale) ? scale : 0;

  const offsetX = (width - spanX * safeScale) / 2;
  const offsetY = (height - spanY * safeScale) / 2;
  const maxCount = maxCellCount(cells);

  return cells.map((cell) => ({
    x: offsetX + (mercatorX(cell.lon) - originX) * safeScale,
    y: offsetY + (mercatorY(cell.lat) - originY) * safeScale,
    weight: normalizeWeight(cell.count, maxCount),
  }));
}
