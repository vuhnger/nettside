import { LAYERS } from "@/lib/architecture";

import { EDGE_COLOR, LAYER_FILL, LAYER_STROKE } from "./graph/colors";
import { ARCHITECTURE_MODULES as modules } from "./graph/data";

/**
 * Tegnforklaring for arkitekturgrafen.
 *
 * Serverkomponent: innholdet er statisk, så det rendres på serveren og ligger
 * utenfor klientbunten. Tallene kommer fra den samme utledede grafen som figuren
 * bruker, så forklaringen kan ikke komme i utakt med det den forklarer.
 *
 * Den står over grafen og ikke under, fordi en fargekode må være lest før man
 * ser på figuren for å ha noen verdi.
 */
const perLayer = LAYERS.map((layer) => ({
  layer,
  count: modules.filter((record) => record.layer === layer).length,
})).filter((entry) => entry.count > 0);

const clientCount = modules.filter((record) => record.runtime === "client").length;

/** Samme filtrering som layouten gjør: bare kanter mellom filer som er skannet. */
const known = new Set(modules.map((record) => record.id));
const edgeCount = modules.reduce(
  (total, record) =>
    total + record.imports.filter((dependency) => known.has(dependency)).length,
  0,
);

const SUBTLE = "var(--ds-color-neutral-text-subtle)";

const GraphLegend = () => (
  <div className="mb-6 flex flex-col gap-3 text-xs">
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {perLayer.map(({ layer, count }) => (
        <li key={layer} className="flex items-center gap-1.5">
          {/* Fyll og omriss som i grafen, ikke bare fyllet: prikken skal se ut
              som nodene den forklarer. */}
          <span
            aria-hidden="true"
            className="size-3 shrink-0 rounded-full border-[1.5px]"
            style={{
              backgroundColor: LAYER_FILL[layer],
              borderColor: LAYER_STROKE[layer],
            }}
          />
          <span className="font-mono font-medium">{layer}/</span>
          <span style={{ color: SUBTLE }}>{count}</span>
        </li>
      ))}
    </ul>

    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2" style={{ color: SUBTLE }}>
      <li className="flex items-center gap-1.5">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="5" fill="currentColor" fillOpacity="0.85" />
        </svg>
        fylt: havner i nettleseren ({clientCount})
      </li>
      <li className="flex items-center gap-1.5">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
          <circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        åpen: bare server ({modules.length - clientCount})
      </li>
      <li className="flex items-center gap-1.5">
        {/* Pilspiss også her, for retningen er hele poenget: hvem importerer hvem. */}
        <svg aria-hidden="true" width="38" height="12" viewBox="0 0 38 12">
          <defs>
            <marker
              id="legend-arrow"
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 z" fill={EDGE_COLOR} />
            </marker>
          </defs>
          <circle cx="3" cy="6" r="2.5" fill="currentColor" />
          <line
            x1="7"
            y1="6"
            x2="27"
            y2="6"
            stroke={EDGE_COLOR}
            strokeWidth="1.2"
            markerEnd="url(#legend-arrow)"
          />
          <circle cx="34" cy="6" r="2.5" fill="currentColor" />
        </svg>
        pil: importerer den den peker på ({edgeCount})
      </li>
      <li className="flex items-center gap-1.5">
        <svg aria-hidden="true" width="26" height="12" viewBox="0 0 26 12">
          <circle cx="4" cy="6" r="3" fill="currentColor" fillOpacity="0.85" />
          <circle cx="17" cy="6" r="6" fill="currentColor" fillOpacity="0.85" />
        </svg>
        størrelse: antall filer som importerer den
      </li>
    </ul>
  </div>
);

export default GraphLegend;
