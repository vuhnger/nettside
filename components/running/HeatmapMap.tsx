"use client";

import { useEffect, useRef } from "react";
// Låst til 5.x, ikke av latskap: 6.x utleder adressen til sin egen web worker
// fra `import.meta.url` og gir tom streng med mindre den adressen er http(s).
// Etter Next-bundlingen er den ikke det, så workeren starter aldri og kartet
// blir stående tomt. Eneste vei rundt er å legge workeren fra `dist` i
// `public/` og peke på den med `setWorkerUrl`, altså en kopiert fil som må
// synkes manuelt ved hver oppgradering. 5.x finner workeren selv.
import { MapLibreMap, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getColorScheme, useColorScheme } from "@/lib/color-scheme";
import { dominantClusterBounds, toHeatmapGeoJson } from "@/lib/heatmap";
import type { RunningHeatmap } from "@/services/api/heatmap";
import { basemapStyleUrl } from "./basemap";
import {
  HEATMAP_LAYER_ID,
  HEATMAP_SOURCE_ID,
  heatmapPaint,
  resolveCssColor,
} from "./heatmap-layer";

const FALLBACK_ACCENT = [37, 99, 235] as const;

const readAccentColor = () => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    "--ds-color-accent-base-default",
  );
  return resolveCssColor(value) ?? FALLBACK_ACCENT;
};

type HeatmapMapProps = {
  heatmap: RunningHeatmap;
  /** Beskriver kartet for skjermlesere, som ikke får noe ut av lerretet. */
  label: string;
};

const HeatmapMap = ({ heatmap, label }: HeatmapMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const scheme = useColorScheme();

  // Kartet settes opp én gang. Bakgrunnskartet byttes senere med setStyle,
  // framfor å rive og bygge instansen på nytt hver gang temaet endres.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new MapLibreMap({
      container,
      style: basemapStyleUrl(scheme),
      // Utsnittet settes i konstruktøren framfor med fitBounds, slik at kartet
      // åpner ferdig plassert. Da finnes det ingen innzooming å hoppe over for
      // brukere som har slått av bevegelse.
      //
      // Åpner på den tetteste klyngen, ikke på hele utstrekningen: aggregatet
      // inneholder ferieturer, og `heatmap.bounds` spenner derfor over halve
      // Europa. Alle cellene ligger uansett i kartlaget, så turene lenger unna
      // finnes fortsatt for den som zoomer ut.
      bounds: dominantClusterBounds(heatmap.cells) ?? heatmap.bounds,
      fitBoundsOptions: { padding: 40, animate: false },
      attributionControl: { compact: true },
      // Uten dette spiser kartet rullingen når man scroller forbi det.
      cooperativeGestures: true,
    });

    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    map.getCanvas().setAttribute("aria-label", label);

    // `style.load` kommer både ved oppstart og etter hvert temabytte, så laget
    // legges tilbake av seg selv når setStyle har tømt stilen.
    const addHeatmapLayer = () => {
      if (!map.getSource(HEATMAP_SOURCE_ID)) {
        map.addSource(HEATMAP_SOURCE_ID, {
          type: "geojson",
          data: toHeatmapGeoJson(heatmap.cells),
        });
      }

      if (!map.getLayer(HEATMAP_LAYER_ID)) {
        map.addLayer({
          id: HEATMAP_LAYER_ID,
          type: "heatmap",
          source: HEATMAP_SOURCE_ID,
          paint: heatmapPaint(readAccentColor(), getColorScheme()),
        });
      }
    };

    map.on("style.load", addHeatmapLayer);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Utsnitt og data hører til den første oppbyggingen. Temabytte håndteres i
    // effekten under, så `scheme` skal bevisst ikke bygge kartet på nytt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmap, label]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(basemapStyleUrl(scheme));
  }, [scheme]);

  return (
    <div
      ref={containerRef}
      className="h-[60vh] min-h-[380px] w-full"
      style={{
        borderRadius: "0.5rem",
        overflow: "hidden",
        border: "2px solid var(--ds-color-neutral-border-strong)",
      }}
    />
  );
};

export default HeatmapMap;
