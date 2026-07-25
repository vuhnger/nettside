import type { ColorScheme } from "@/lib/color-scheme";

/**
 * CARTO sine grunnkart er gratis og krever ingen nøkkel, og de finnes i en lys
 * og en mørk variant som følger temaet på siden. De er bevisst nedtonede, slik
 * at varmekartet er det man ser først.
 *
 * URL-ene kan overstyres med miljøvariabler for å bytte leverandør eller peke
 * på en selvhostet stil uten kodeendring.
 */
const DEFAULT_LIGHT_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DEFAULT_DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const lightStyle = process.env.NEXT_PUBLIC_BASEMAP_STYLE_LIGHT || DEFAULT_LIGHT_STYLE;
const darkStyle = process.env.NEXT_PUBLIC_BASEMAP_STYLE_DARK || DEFAULT_DARK_STYLE;

export const basemapStyleUrl = (scheme: ColorScheme): string =>
  scheme === "dark" ? darkStyle : lightStyle;
