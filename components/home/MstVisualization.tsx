"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { UnionFind } from "@/lib/mst";

import { useVisualizationEnvironment } from "@/components/visualization/useVisualizationEnvironment";
import { createGraph, type Edge, type Graph } from "./mst/scene";
import {
  BASE_SETTINGS,
  MOBILE_SETTINGS,
  REDUCED_SETTINGS,
} from "./mst/settings";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

type GraphState = {
  key: string;
  graph: Graph;
};

const setLinePosition = (line: SVGLineElement, edge: Edge) => {
  line.setAttribute("x1", String(edge.from.position.x));
  line.setAttribute("y1", String(edge.from.position.y));
  line.setAttribute("x2", String(edge.to.position.x));
  line.setAttribute("y2", String(edge.to.position.y));
};

type MstVisualizationProps = {
  showGrid?: boolean;
};

const MstVisualization = ({ showGrid = true }: MstVisualizationProps) => {
  const patternId = `mst-grid-${useId().replace(/:/g, "")}`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mstGroupRef = useRef<SVGGElement | null>(null);
  const currentEdgeRef = useRef<SVGLineElement | null>(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const environment = useVisualizationEnvironment();
  const [graphState, setGraphState] = useState<GraphState>({
    key: "",
    graph: { nodes: [], edges: [], completedEdges: [] },
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let animationFrame = 0;
    const update = () => {
      animationFrame = 0;
      setViewport((current) => {
        const next = { width: window.innerWidth, height: window.innerHeight };
        return current.width === next.width && current.height === next.height ? current : next;
      });
    };
    const handleResize = () => {
      if (animationFrame === 0) animationFrame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let visible = !document.hidden;
    let intersecting = true;
    const update = () => setIsPaused(!(visible && intersecting));
    const handleVisibility = () => {
      visible = !document.hidden;
      update();
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      update();
    });

    observer.observe(container);
    document.addEventListener("visibilitychange", handleVisibility);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [viewport.height, viewport.width]);

  const settings = environment.reducedMotion
    ? REDUCED_SETTINGS
    : environment.mobile
      ? MOBILE_SETTINGS
      : BASE_SETTINGS;
  const graphKey = `${viewport.width}:${viewport.height}:${settings.nodeCount}:${environment.reducedMotion}`;
  if (graphState.key !== graphKey) {
    setGraphState({
      key: graphKey,
      graph:
        viewport.width === 0 || viewport.height === 0
          ? { nodes: [], edges: [], completedEdges: [] }
          : createGraph(viewport.width, viewport.height, settings, environment.reducedMotion),
    });
  }
  const graph = graphState.graph;

  useLayoutEffect(() => {
    const mstGroup = mstGroupRef.current;
    const currentLine = currentEdgeRef.current;
    if (!mstGroup || !currentLine) return;

    currentLine.setAttribute("visibility", "hidden");
    if (environment.reducedMotion || isPaused || graph.nodes.length === 0) return;

    let cancelled = false;
    const timeouts = new Set<number>();
    const wait = (milliseconds: number) =>
      new Promise<void>((resolve) => {
        const timeout = window.setTimeout(() => {
          timeouts.delete(timeout);
          resolve();
        }, milliseconds);
        timeouts.add(timeout);
      });
    mstGroup.replaceChildren();
    containerRef.current?.querySelectorAll("[data-mst-node]").forEach((node) => {
      node.setAttribute("fill-opacity", "0.25");
      node.setAttribute("stroke-opacity", "0.35");
    });
    containerRef.current?.querySelectorAll("[data-mst-label]").forEach((label) => {
      label.setAttribute("fill-opacity", "0.4");
    });

    const run = async () => {
      await wait(settings.startDelay);
      if (cancelled) return;

      const unionFind = new UnionFind(graph.nodes.length);
      let acceptedCount = 0;
      for (const edge of graph.edges) {
        if (cancelled) return;
        setLinePosition(currentLine, edge);
        currentLine.setAttribute("visibility", "visible");
        await wait(settings.stepDelay);
        if (cancelled) return;

        if (unionFind.union(edge.from.id, edge.to.id)) {
          const line = document.createElementNS(SVG_NAMESPACE, "line");
          setLinePosition(line, edge);
          line.setAttribute("stroke", "var(--mst-active)");
          line.setAttribute("stroke-opacity", "0.8");
          line.setAttribute("stroke-width", "2");
          mstGroup.append(line);
          acceptedCount += 1;
          if (acceptedCount === graph.nodes.length - 1) break;
          await wait(settings.stepDelay);
        } else {
          await wait(settings.skipDelay);
        }
      }

      if (cancelled) return;
      currentLine.setAttribute("visibility", "hidden");
      mstGroup.querySelectorAll("line").forEach((line) => {
        line.setAttribute("stroke", "var(--mst-complete)");
        line.setAttribute("stroke-opacity", "0.95");
        line.setAttribute("stroke-width", "2.5");
      });
      containerRef.current?.querySelectorAll("[data-mst-node]").forEach((node) => {
        node.setAttribute("fill-opacity", "0.65");
        node.setAttribute("stroke-opacity", "0.6");
      });
      containerRef.current?.querySelectorAll("[data-mst-label]").forEach((label) => {
        label.setAttribute("fill-opacity", "0.7");
      });

      await wait(settings.cyclePause);
      if (!cancelled) {
        setGraphState({
          key: graphKey,
          graph: createGraph(viewport.width, viewport.height, settings, false),
        });
      }
    };

    run();
    return () => {
      cancelled = true;
      timeouts.forEach(window.clearTimeout);
      mstGroup.replaceChildren();
      currentLine.setAttribute("visibility", "hidden");
    };
  }, [environment.reducedMotion, graph, graphKey, isPaused, settings, viewport.height, viewport.width]);

  if (viewport.width === 0 || viewport.height === 0) {
    return <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" />;
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 [--mst-grid:var(--ds-color-neutral-border-subtle)] [--mst-edge:var(--ds-color-neutral-border-default)] [--mst-node-fill:var(--ds-color-neutral-text-default)] [--mst-node-stroke:var(--ds-color-neutral-text-default)] [--mst-label:var(--ds-color-neutral-text-default)] [--mst-active:var(--ds-color-accent-base-default)] [--mst-complete:light-dark(var(--ds-color-warning-border-subtle),var(--ds-color-warning-border-strong))] [--mst-current:var(--ds-color-accent-base-hover)]"
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {showGrid ? (
          <>
            <defs>
              <pattern
                id={patternId}
                width={settings.gridSize}
                height={settings.gridSize}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${settings.gridSize} 0 L 0 0 0 ${settings.gridSize}`}
                  fill="none"
                  stroke="var(--mst-grid)"
                  strokeOpacity="0.35"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${patternId})`} />
          </>
        ) : null}

        {graph.edges.map((edge) => (
          <line
            key={`edge-${edge.from.id}-${edge.to.id}`}
            x1={edge.from.position.x}
            y1={edge.from.position.y}
            x2={edge.to.position.x}
            y2={edge.to.position.y}
            stroke="var(--mst-edge)"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        ))}

        <g key={graphState.key} ref={mstGroupRef}>
          {graph.completedEdges.map((edge) => (
            <line
              key={`mst-${edge.from.id}-${edge.to.id}`}
              x1={edge.from.position.x}
              y1={edge.from.position.y}
              x2={edge.to.position.x}
              y2={edge.to.position.y}
              stroke="var(--mst-complete)"
              strokeOpacity="0.95"
              strokeWidth="2.5"
            />
          ))}
        </g>

        <line
          ref={currentEdgeRef}
          stroke="var(--mst-current)"
          strokeOpacity="0.7"
          strokeWidth="1.5"
          visibility="hidden"
        />

        {graph.nodes.map((node) => (
          <circle
            data-mst-node
            key={`node-${node.id}`}
            cx={node.position.x}
            cy={node.position.y}
            r={settings.nodeRadius}
            fill="var(--mst-node-fill)"
            fillOpacity={environment.reducedMotion ? "0.65" : "0.25"}
            stroke="var(--mst-node-stroke)"
            strokeOpacity={environment.reducedMotion ? "0.6" : "0.35"}
            strokeWidth="1.5"
          />
        ))}

        {graph.nodes.map((node) => (
          <text
            data-mst-label
            key={`label-${node.id}`}
            x={node.position.x}
            y={node.position.y + 4}
            textAnchor="middle"
            fill="var(--mst-label)"
            fillOpacity={environment.reducedMotion ? "0.7" : "0.4"}
            fontSize="10"
            fontFamily="ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace"
            fontWeight="600"
          >
            {node.id}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default MstVisualization;
