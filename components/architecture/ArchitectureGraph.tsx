"use client";

import { useVisualizationEnvironment } from "@/components/visualization/useVisualizationEnvironment";

import { ARCHITECTURE_MODULES, RUNTIME_OF } from "./graph/data";
import GraphEdges from "./graph/GraphEdges";
import GraphLabels from "./graph/GraphLabels";
import GraphNodes from "./graph/GraphNodes";
import { BASE_SETTINGS, MOBILE_SETTINGS, REDUCED_SETTINGS } from "./graph/settings";
import { describeGraph } from "./graph/summary";
import { useActiveNode } from "./graph/useActiveNode";
import { useGraphLayout } from "./graph/useGraphLayout";

/**
 * Importgrafen til denne kodebasen, tegnet av seg selv.
 *
 * Komponenten setter bare sammen delene: `useGraphLayout` regner ut og skriver
 * posisjoner, `useActiveNode` holder hva som er markert, og de tre
 * underkomponentene rendrer kanter, noder og navn. Tegnforklaringen ligger i
 * `GraphLegend`, som er en serverkomponent.
 */
const ArchitectureGraph = () => {
  const environment = useVisualizationEnvironment();
  const settings = environment.reducedMotion
    ? REDUCED_SETTINGS
    : environment.mobile
      ? MOBILE_SETTINGS
      : BASE_SETTINGS;

  const { simulation, elements, painted } = useGraphLayout(ARCHITECTURE_MODULES, settings);
  const { active, activeSet, setActive } = useActiveNode(simulation.edges);

  return (
    <svg
      role="img"
      aria-label={describeGraph(ARCHITECTURE_MODULES, simulation.edges.length)}
      viewBox={`0 0 ${settings.width} ${settings.height}`}
      className="h-auto w-full transition-opacity duration-300 motion-reduce:transition-none"
      style={{ opacity: painted ? 1 : 0 }}
    >
      <GraphEdges
        edges={simulation.edges}
        elements={elements}
        active={active}
        hasActive={activeSet !== null}
      />
      <GraphNodes
        nodes={simulation.nodes}
        runtimeOf={RUNTIME_OF}
        elements={elements}
        active={active}
        activeSet={activeSet}
        onActivate={setActive}
      />
      <GraphLabels
        nodes={simulation.nodes}
        elements={elements}
        active={active}
        labelThreshold={settings.labelThreshold}
      />
    </svg>
  );
};

export default ArchitectureGraph;
