"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import graphData from "@/data/architecture-graph.json";
import { LAYERS, buildArchitectureGraph, type ModuleRecord } from "@/lib/architecture";
import {
  createFrameTransform,
  createSimulation,
  settleSimulation,
  stepSimulation,
  transformX,
  transformY,
} from "@/lib/architecture-layout";

import { useVisualizationEnvironment } from "@/components/visualization/useVisualizationEnvironment";
import { BASE_SETTINGS, MOBILE_SETTINGS, REDUCED_SETTINGS } from "./graph/settings";

/**
 * Grafen leses inn her, i klientkomponenten, og ikke som props fra siden.
 *
 * AGENTS.md advarer mot å sende store statiske datastrukturer gjennom
 * Client Component-props: da havner hele grafen i HTML-en som serialisert
 * payload i tillegg til i bunten. Importert her ligger den bare i bunten.
 *
 * Konsekvensen er verdt å nevne: dette er grunnen til at `lib/architecture.ts`
 * og `lib/architecture-layout.ts` selv står som klientfiler i grafen. Grafen
 * viser altså sin egen visualisering.
 */
const modules = buildArchitectureGraph(graphData.modules as ModuleRecord[]).modules;

/** Oppslag framfor indeks: simuleringsnodene skal ikke måtte ligge i samme rekkefølge. */
const runtimeOf = new Map(modules.map((record) => [record.id, record.runtime]));

/** Minsteradius 4, ikke 3: en node på 6 px i diameter er vanskelig å treffe med musa. */
const nodeRadius = (inDegree: number) => 4 + Math.sqrt(inDegree) * 2.4;

const ArchitectureGraph = () => {
  const environment = useVisualizationEnvironment();
  const settings = environment.reducedMotion
    ? REDUCED_SETTINGS
    : environment.mobile
      ? MOBILE_SETTINGS
      : BASE_SETTINGS;

  const [active, setActive] = useState<string | null>(null);
  /**
   * Koordinatene settes bare på klienten, aldri i HTML-en.
   *
   * Layouten er deterministisk innenfor én JavaScript-motor, men `Math.cos` og
   * `Math.sin` er ikke pålagt å gi bit-identiske svar på tvers av dem. Nodes V8
   * og Chromes V8 ga 779.2369769141981 mot 779.236976914198, og React meldte
   * hydration mismatch på hver linje og sirkel. Med 300 iterasjoner kan et
   * avvik på siste bit dessuten vokse, så avrunding ville bare skjult det.
   *
   * Derfor står grafen usynlig til første posisjonsskriving. Lista under er ikke
   * avhengig av dette og rendres som vanlig, så innhold går ikke tapt.
   */
  const [painted, setPainted] = useState(false);

  const simulation = useMemo(() => {
    const created = createSimulation(modules, settings.width, settings.height, settings);
    // Uten animasjon skal grafen stå ferdig ved første maling, ikke falle til ro
    // etterpå.
    return settings.stepsPerFrame === 0 ? settleSimulation(created, settings) : created;
  }, [settings]);

  /** Kantene som node-indekser, så animasjonen slipper oppslag per ramme. */
  const edgeIndices = useMemo(() => {
    const indexOf = new Map(simulation.nodes.map((node, index) => [node.id, index]));
    return simulation.edges.map((edge) => ({
      from: indexOf.get(edge.from) ?? 0,
      to: indexOf.get(edge.to) ?? 0,
    }));
  }, [simulation]);

  /** Naboer i begge retninger, for å kunne markere alt en fil henger sammen med. */
  const neighbours = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const link = (from: string, to: string) => {
      if (!map.has(from)) map.set(from, new Set());
      map.get(from)?.add(to);
    };
    for (const edge of simulation.edges) {
      link(edge.from, edge.to);
      link(edge.to, edge.from);
    }
    return map;
  }, [simulation]);

  const nodeElements = useRef<(SVGCircleElement | null)[]>([]);
  const labelElements = useRef<(SVGTextElement | null)[]>([]);
  const edgeElements = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const writePositions = () => {
      // Regnes ut på nytt hver ramme, så grafen fyller rammen hele veien mens den
      // faller til ro - ikke bare når den er ferdig.
      const frame = createFrameTransform(simulation, settings);
      const screenX = (value: number) => transformX(frame, value);
      const screenY = (value: number) => transformY(frame, value);

      simulation.nodes.forEach((node, index) => {
        const x = screenX(node.x);
        const y = screenY(node.y);
        nodeElements.current[index]?.setAttribute("cx", String(x));
        nodeElements.current[index]?.setAttribute("cy", String(y));
        labelElements.current[index]?.setAttribute("x", String(x));
        labelElements.current[index]?.setAttribute(
          "y",
          String(y - nodeRadius(node.inDegree) - 4),
        );
      });

      edgeIndices.forEach((edge, index) => {
        const from = simulation.nodes[edge.from];
        const to = simulation.nodes[edge.to];
        const element = edgeElements.current[index];
        if (!from || !to || !element) return;
        element.setAttribute("x1", String(screenX(from.x)));
        element.setAttribute("y1", String(screenY(from.y)));
        element.setAttribute("x2", String(screenX(to.x)));
        element.setAttribute("y2", String(screenY(to.y)));
      });
    };

    writePositions();
    setPainted(true);
    if (settings.stepsPerFrame === 0) return;

    let frame = requestAnimationFrame(function tick() {
      for (let step = 0; step < settings.stepsPerFrame; step += 1) {
        stepSimulation(simulation, settings);
      }
      writePositions();
      // Stopper når grafen har falt til ro. Ingen evig animasjon å måtte skru av.
      if (simulation.step < settings.iterations) frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [edgeIndices, settings, simulation]);

  const activeSet = useMemo(() => {
    if (!active) return null;
    return new Set([active, ...(neighbours.get(active) ?? [])]);
  }, [active, neighbours]);

  const clientCount = modules.filter((record) => record.runtime === "client").length;
  const summary =
    `Importgraf over kildekoden: ${modules.length} filer og ${simulation.edges.length} ` +
    `avhengigheter. ${clientCount} filer havner i nettleserbunten, ` +
    `${modules.length - clientCount} kjører bare på serveren.`;

  return (
    <div className="[--graph-edge:var(--ds-color-neutral-border-default)] [--graph-server:var(--ds-color-neutral-text-default)] [--graph-client:var(--ds-color-accent-base-default)] [--graph-label:var(--ds-color-neutral-text-default)]">
      <svg
        role="img"
        aria-label={summary}
        viewBox={`0 0 ${settings.width} ${settings.height}`}
        className="h-auto w-full transition-opacity duration-300 motion-reduce:transition-none"
        style={{ opacity: painted ? 1 : 0 }}
      >
        {simulation.edges.map((edge, index) => {
          const highlighted =
            activeSet !== null && (edge.from === active || edge.to === active);
          return (
            <line
              key={`${edge.from}->${edge.to}`}
              ref={(element) => {
                edgeElements.current[index] = element;
              }}
              stroke={highlighted ? "var(--graph-client)" : "var(--graph-edge)"}
              strokeOpacity={activeSet === null ? 0.28 : highlighted ? 0.9 : 0.08}
              strokeWidth={highlighted ? 1.6 : 1}
            />
          );
        })}

        {simulation.nodes.map((node, index) => {
          const dimmed = activeSet !== null && !activeSet.has(node.id);
          const isClient = runtimeOf.get(node.id) === "client";
          return (
            <circle
              key={node.id}
              ref={(element) => {
                nodeElements.current[index] = element;
              }}
              r={nodeRadius(node.inDegree)}
              fill={isClient ? "var(--graph-client)" : "var(--graph-server)"}
              fillOpacity={dimmed ? 0.15 : isClient ? 0.85 : 0.5}
              stroke={isClient ? "var(--graph-client)" : "var(--graph-server)"}
              strokeOpacity={dimmed ? 0.15 : 0.7}
              strokeWidth={node.id === active ? 2.5 : 1}
              // Hover direkte på grafen. Nodene får ikke tabindex: 83 tabstopp i
              // en SVG er ubrukelig navigasjon. Tastaturveien går via lista under,
              // som markerer den samme noden.
              onMouseEnter={() => setActive(node.id)}
              onMouseLeave={() => setActive(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}

        {simulation.nodes.map((node, index) => {
          const visible = node.id === active || node.inDegree >= settings.labelThreshold;
          return (
            <text
              key={node.id}
              ref={(element) => {
                labelElements.current[index] = element;
              }}
              textAnchor="middle"
              fill="var(--graph-label)"
              fillOpacity={visible ? (node.id === active ? 1 : 0.65) : 0}
              fontSize={node.id === active ? 13 : 11}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              fontWeight={node.id === active ? 700 : 500}
            >
              {node.id}
            </text>
          );
        })}
      </svg>

      {/*
        Listen er ikke pynt. SVG-en er `role="img"` med en oppsummering, så den
        forteller ikke en skjermleser hvilke filer som finnes - det gjør denne.
        Den er samtidig tastaturinngangen til grafen: fokus på et element
        markerer noden, slik at det å utforske grafen ikke krever mus.
      */}
      {/*
        Kolonneflyt, ikke grid. Grid justerer radhøyder, så `app` med 15 filer sto
        ved siden av `components` med 52 og etterlot 37 rader tomrom - siden ble
        3043 px. Og maks to kolonner: tre ga under 200 px hver, og da overlappet
        navn som `master/edge/NetworkControls.tsx` hverandre.
      */}
      <div className="mt-8 gap-10 md:columns-2">
        {LAYERS.map((layer) => {
          const inLayer = modules.filter((record) => record.layer === layer);
          if (inLayer.length === 0) return null;
          const clientsInLayer = inLayer.filter((record) => record.runtime === "client").length;

          return (
            <section key={layer} className="mb-6 inline-block w-full break-inside-avoid">
              <h2
                className="font-mono text-sm font-bold"
                style={{ color: "var(--ds-color-accent-base-default)" }}
              >
                {layer}
                <span
                  className="ml-2 font-normal"
                  style={{ color: "var(--ds-color-neutral-text-subtle)" }}
                >
                  {inLayer.length} · {clientsInLayer} klient
                </span>
              </h2>
              <ul className="mt-2 space-y-0.5">
                {inLayer.map((record) => (
                  <li key={record.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(record.id)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(record.id)}
                      onBlur={() => setActive(null)}
                      className="w-full rounded px-1 text-left font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                      style={{
                        color:
                          record.runtime === "client"
                            ? "var(--ds-color-accent-base-default)"
                            : "var(--ds-color-neutral-text-subtle)",
                        backgroundColor:
                          active === record.id
                            ? "var(--ds-color-accent-surface-tinted)"
                            : "transparent",
                        outlineColor: "var(--ds-color-accent-base-default)",
                      }}
                    >
                      {record.id.slice(layer.length + 1)}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default ArchitectureGraph;
