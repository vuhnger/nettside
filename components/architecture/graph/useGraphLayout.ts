"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ArchitectureModule } from "@/lib/architecture";
import {
  createFrameTransform,
  createSimulation,
  settleSimulation,
  stepSimulation,
  transformX,
  transformY,
} from "@/lib/architecture-layout";

import { hiddenLabels, type LabelBox } from "./labels";
import type { GraphSettings } from "./settings";
import { nodeRadius } from "./summary";

/** Luft mellom pilspissen og målnoden, så spissen er tydelig løsrevet. */
const ARROW_GAP = 3;

export type GraphElements = {
  nodes: React.RefObject<(SVGCircleElement | null)[]>;
  labels: React.RefObject<(SVGTextElement | null)[]>;
  edges: React.RefObject<(SVGLineElement | null)[]>;
};

/**
 * Kjører layouten og skriver posisjonene rett på DOM-nodene.
 *
 * Posisjonene settes imperativt og ikke gjennom React-state. 93 noder, 93
 * navn og 127 kanter er over 300 elementer som flytter seg hver ramme, og en
 * ny render per ramme av det ville vært bortkastet arbeid - ingenting annet enn
 * koordinatene endrer seg.
 *
 * Koordinatene settes dessuten bare på klienten, aldri i HTML-en. Layouten er
 * deterministisk innenfor én JavaScript-motor, men `Math.cos` og `Math.sin` er
 * ikke pålagt å gi bit-identiske svar på tvers av dem. Nodes V8 og Chromes V8
 * ga 779.2369769141981 mot 779.236976914198, og React meldte hydration mismatch
 * på hver linje og sirkel. Med 300 iterasjoner kan et avvik på siste bit vokse,
 * så avrunding ville bare skjult det.
 *
 * `painted` er derfor false til første posisjonsskriving, og grafen fades inn.
 * Tegnforklaringen er en serverkomponent og påvirkes ikke, så siden er ikke tom
 * imens.
 */
export function useGraphLayout(
  modules: readonly ArchitectureModule[],
  settings: GraphSettings,
) {
  const [painted, setPainted] = useState(false);

  const simulation = useMemo(() => {
    const created = createSimulation(modules, settings.width, settings.height, settings);
    // Uten animasjon skal grafen stå ferdig ved første maling, ikke falle til ro
    // etterpå.
    return settings.stepsPerFrame === 0 ? settleSimulation(created, settings) : created;
  }, [modules, settings]);

  /** Kantene som node-indekser, så animasjonen slipper oppslag per ramme. */
  const edgeIndices = useMemo(() => {
    const indexOf = new Map(simulation.nodes.map((node, index) => [node.id, index]));
    return simulation.edges.map((edge) => ({
      from: indexOf.get(edge.from) ?? 0,
      to: indexOf.get(edge.to) ?? 0,
    }));
  }, [simulation]);

  const elements: GraphElements = {
    nodes: useRef<(SVGCircleElement | null)[]>([]),
    labels: useRef<(SVGTextElement | null)[]>([]),
    edges: useRef<(SVGLineElement | null)[]>([]),
  };

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
        elements.nodes.current[index]?.setAttribute("cx", String(x));
        elements.nodes.current[index]?.setAttribute("cy", String(y));
        elements.labels.current[index]?.setAttribute("x", String(x));
        elements.labels.current[index]?.setAttribute(
          "y",
          String(y - nodeRadius(node.inDegree) - 4),
        );
      });

      edgeIndices.forEach((edge, index) => {
        const from = simulation.nodes[edge.from];
        const to = simulation.nodes[edge.to];
        const element = elements.edges.current[index];
        if (!from || !to || !element) return;

        const x1 = screenX(from.x);
        const y1 = screenY(from.y);
        const x2 = screenX(to.x);
        const y2 = screenY(to.y);

        // Streken stopper på kanten av målnoden, ikke i sentrum: ellers ville
        // pilspissen ligget under sirkelen og retningen vært usynlig.
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        const length = Math.max(0.01, Math.hypot(deltaX, deltaY));
        const inset = Math.min(length - 0.01, nodeRadius(to.inDegree) + ARROW_GAP);

        element.setAttribute("x1", String(x1));
        element.setAttribute("y1", String(y1));
        element.setAttribute("x2", String(x2 - (deltaX / length) * inset));
        element.setAttribute("y2", String(y2 - (deltaY / length) * inset));
      });

      hideCollidingLabels();
    };

    /**
     * Skjuler filnavn som ville lagt seg oppå et annet.
     *
     * Arbeidsdelingen: React bestemmer hvilke navn som er aktuelle, gjennom
     * `fill-opacity`. `hiddenLabels` bestemmer hvilke av dem det er plass til,
     * og svaret settes med `style.opacity`. To ulike egenskaper, så ingen av dem
     * overskriver den andre.
     */
    function hideCollidingLabels() {
      const eligible: LabelBox[] = [];
      const elementOf = new Map<string, SVGTextElement>();

      simulation.nodes.forEach((node, index) => {
        const element = elements.labels.current[index];
        if (!element) return;
        if (element.getAttribute("fill-opacity") === "0") {
          element.style.opacity = "";
          return;
        }

        elementOf.set(node.id, element);
        eligible.push({
          id: node.id,
          x: Number(element.getAttribute("x")),
          bottom: Number(element.getAttribute("y")),
          fontSize: Number(element.getAttribute("font-size")) || 11,
          characters: node.id.length,
          priority: node.inDegree,
        });
      });

      const hidden = hiddenLabels(eligible);
      for (const [id, element] of elementOf) {
        element.style.opacity = hidden.has(id) ? "0" : "1";
      }
    }

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
    // `elements.*` er ref-objekter fra `useRef` og dermed stabile, men de står i
    // lista for at regelen skal kunne verifisere det selv.
  }, [edgeIndices, elements.edges, elements.labels, elements.nodes, settings, simulation]);

  return { simulation, elements, painted };
}
