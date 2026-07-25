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
 * Bygger projeksjonen fra geografiske koordinater til et SVG-koordinatsystem.
 * Samme Web Mercator som kartbiblioteket bruker, slik at teaseren og det
 * interaktive kartet viser nøyaktig samme form.
 *
 * Målforholdet bevares og innholdet sentreres — strekker vi bildet for å fylle
 * viewBoxen blir byen visuelt feil.
 */
function createProjection(bounds: HeatmapBounds, width: number, height: number) {
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

  return (lon: number, lat: number) => ({
    x: offsetX + (mercatorX(lon) - originX) * safeScale,
    y: offsetY + (mercatorY(lat) - originY) * safeScale,
  });
}

/** Projiserer hver celle for seg, uten nedskalering. */
export function projectCells(
  cells: readonly HeatmapCell[],
  bounds: HeatmapBounds,
  width: number,
  height: number,
): ProjectedCell[] {
  const project = createProjection(bounds, width, height);
  const maxCount = maxCellCount(cells);

  return cells.map((cell) => {
    const { x, y } = project(cell.lon, cell.lat);
    return { x, y, weight: normalizeWeight(cell.count, maxCount) };
  });
}

/**
 * Slår cellene sammen til et grovere rutenett før de tegnes.
 *
 * Aggregatet dekker et par mil med 15-meters celler, altså tusenvis av punkter.
 * I den lille teaseren på forsiden er en celle uansett mindre enn én piksel, så
 * å sende hver enkelt ville blåst opp HTML-en uten å legge til noe man kan se.
 *
 * Treffene summeres innenfor hver rute, ikke maksimeres: da måler ruten hvor
 * mye løping som har skjedd i området, som er samme tetthetsbegrep kartlagets
 * `heatmap`-modus bruker. Teaser og kart leser dermed likt.
 */
export function rasterizeCells(
  cells: readonly HeatmapCell[],
  bounds: HeatmapBounds,
  width: number,
  height: number,
  pixelSize: number,
): ProjectedCell[] {
  if (pixelSize <= 0) return projectCells(cells, bounds, width, height);

  const project = createProjection(bounds, width, height);
  const buckets = new Map<string, { x: number; y: number; count: number }>();

  // Utstrekningen kommer fra cellene selv, så det finnes alltid en celle helt ute
  // ved øst- og sørkanten. Den projiseres til presis `width`/`height`, og et rent
  // `Math.floor` ville gitt den en egen rute utenfor tegneflaten. Ytterpunktet av
  // varmekartet ble dermed klippet bort. Kanten hører til siste rute.
  const lastColumn = Math.max(Math.ceil(width / pixelSize) - 1, 0);
  const lastRow = Math.max(Math.ceil(height / pixelSize) - 1, 0);

  // Ruten plasseres i sentrum av den delen som er synlig, ikke der den første
  // cellen tilfeldigvis traff. Da legger punktene seg jevnt i rutenettet, og en
  // siste rute som stikker utenfor flaten trekkes inn framfor å havne på kanten.
  const center = (index: number, size: number) => {
    const start = index * pixelSize;
    return (start + Math.min(start + pixelSize, size)) / 2;
  };

  for (const cell of cells) {
    const { x, y } = project(cell.lon, cell.lat);
    const column = Math.min(Math.floor(x / pixelSize), lastColumn);
    const row = Math.min(Math.floor(y / pixelSize), lastRow);
    const key = `${column}:${row}`;
    const existing = buckets.get(key);

    if (existing) {
      existing.count += cell.count;
      continue;
    }

    buckets.set(key, {
      x: center(column, width),
      y: center(row, height),
      count: cell.count,
    });
  }

  let maxCount = 0;
  for (const bucket of buckets.values()) {
    if (bucket.count > maxCount) maxCount = bucket.count;
  }

  return Array.from(buckets.values(), (bucket) => ({
    x: bucket.x,
    y: bucket.y,
    weight: normalizeWeight(bucket.count, maxCount),
  }));
}
