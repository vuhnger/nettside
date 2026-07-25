import type { AddLayerObject } from "maplibre-gl";
import type { ColorScheme } from "@/lib/color-scheme";

export const HEATMAP_SOURCE_ID = "running-heatmap-cells";
export const HEATMAP_LAYER_ID = "running-heatmap";

/**
 * Kartbiblioteket eksporterer ikke lagspesifikasjonene enkeltvis, så typen
 * plukkes ut av unionen. Da får uttrykkene under ekte typesjekk framfor å bli
 * castet inn i `addLayer`.
 */
type HeatmapPaint = NonNullable<Extract<AddLayerObject, { type: "heatmap" }>["paint"]>;

type Rgb = readonly [number, number, number];

/**
 * Designsystemet eksponerer fargene som CSS-variabler, og kartbiblioteket kan
 * ikke lese dem — det trenger konkrete fargeverdier i stilobjektet.
 *
 * Verdien males derfor på et 1x1-lerret og leses tilbake som piksel. Da er det
 * nettleserens egen fargeparser som gjør jobben, og oppslaget fortsetter å virke
 * uansett hvilken syntaks temaet bruker. Variablene er hex i dag, men
 * Designsystemet leverer `oklch` fra egen temabygger, og det ville ellers
 * knekt stille ved neste temabytte.
 */
export function resolveCssColor(value: string): Rgb | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Ugyldige verdier lar `fillStyle` stå urørt, så lerretet ville rapportert
  // forrige farge framfor å feile. Valideringen må skje før vi maler.
  if (typeof CSS === "undefined" || !CSS.supports("color", trimmed)) return null;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.fillStyle = trimmed;
  context.fillRect(0, 0, 1, 1);

  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return [red, green, blue];
}

const rgba = (color: Rgb, alpha: number) => `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;

const mix = (color: Rgb, target: Rgb, amount: number): Rgb => [
  Math.round(color[0] + (target[0] - color[0]) * amount),
  Math.round(color[1] + (target[1] - color[1]) * amount),
  Math.round(color[2] + (target[2] - color[2]) * amount),
];

const WHITE: Rgb = [255, 255, 255];
const INK: Rgb = [12, 20, 38];

/**
 * Toppen av skalaen må bevege seg bort fra bakgrunnen, ikke mot den. På det
 * mørke bakgrunnskartet betyr det at de mest brukte rutene lyser opp mot hvitt,
 * på det lyse at de går mot dypt blåsvart. Samme aksentfarge i bunnen begge
 * veier, så kartet fortsatt ser ut som resten av siden.
 */
const peakTarget = (scheme: ColorScheme): Rgb => (scheme === "dark" ? WHITE : INK);

export function heatmapColorRamp(accent: Rgb, scheme: ColorScheme): HeatmapPaint["heatmap-color"] {
  const peak = peakTarget(scheme);

  return [
    "interpolate",
    ["linear"],
    ["heatmap-density"],
    // Nullpunktet må være helt gjennomsiktig, ellers legger laget en heldekkende
    // flate over hele kartet i stedet for bare der det er løpt.
    0,
    rgba(accent, 0),
    0.15,
    rgba(accent, 0.35),
    0.4,
    rgba(accent, 0.75),
    0.65,
    rgba(accent, 1),
    0.85,
    rgba(mix(accent, peak, 0.45), 1),
    1,
    rgba(mix(accent, peak, 0.8), 1),
  ];
}

/**
 * Radiusen er oppgitt i skjermpiksler, mens cellene har fast størrelse i meter.
 * Uten zoomskalering blir kartet enten en grøt på lang avstand eller løsrevne
 * prikker på nært hold. Stoppene følger meter-per-piksel omtrent, men flater ut
 * i begge ender: helt tro skalering ville gitt under én piksel på bynivå.
 */
const heatmapRadius: HeatmapPaint["heatmap-radius"] = [
  "interpolate",
  ["exponential", 1.6],
  ["zoom"],
  9,
  2,
  12,
  5,
  15,
  13,
  18,
  32,
];

/**
 * Tettheten legges sammen per piksel, så jo lenger ut man zoomer, jo flere
 * celler bidrar til samme punkt. Intensiteten dempes derfor på lavt zoomnivå
 * for at oversiktsbildet ikke skal gå i metning.
 */
const heatmapIntensity: HeatmapPaint["heatmap-intensity"] = [
  "interpolate",
  ["linear"],
  ["zoom"],
  9,
  0.6,
  13,
  1,
  18,
  2.2,
];

export function heatmapPaint(accent: Rgb, scheme: ColorScheme): HeatmapPaint {
  return {
    // Vekten er allerede normalisert til 0-1 mot den travleste cellen.
    "heatmap-weight": ["get", "weight"],
    "heatmap-intensity": heatmapIntensity,
    "heatmap-color": heatmapColorRamp(accent, scheme),
    "heatmap-radius": heatmapRadius,
    "heatmap-opacity": scheme === "dark" ? 0.9 : 0.8,
  };
}
