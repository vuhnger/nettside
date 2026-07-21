"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

type Position = {
  x: number;
  y: number;
};

type Node = {
  id: number;
  position: Position;
};

type Edge = {
  from: Node;
  to: Node;
  weight: number;
};

type Settings = {
  nodeCount: number;
  nodeRadius: number;
  gridSize: number;
  startDelay: number;
  stepDelay: number;
  skipDelay: number;
  cyclePause: number;
};

type Graph = {
  nodes: Node[];
  edges: Edge[];
  completedEdges: Edge[];
};

type GraphState = {
  key: string;
  graph: Graph;
};

const BASE_SETTINGS: Settings = {
  nodeCount: 20,
  nodeRadius: 9,
  gridSize: 32,
  startDelay: 150,
  stepDelay: 40,
  skipDelay: 20,
  cyclePause: 3500,
};

const MOBILE_SETTINGS: Settings = {
  nodeCount: 10,
  nodeRadius: 8,
  gridSize: 40,
  startDelay: 260,
  stepDelay: 70,
  skipDelay: 35,
  cyclePause: 4000,
};

const REDUCED_SETTINGS: Settings = {
  nodeCount: 8,
  nodeRadius: 7,
  gridSize: 48,
  startDelay: 0,
  stepDelay: 0,
  skipDelay: 0,
  cyclePause: 0,
};

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, index) => index);
    this.rank = Array(size).fill(0);
  }

  find(value: number): number {
    if (this.parent[value] !== value) this.parent[value] = this.find(this.parent[value]);
    return this.parent[value];
  }

  union(first: number, second: number): boolean {
    const firstRoot = this.find(first);
    const secondRoot = this.find(second);
    if (firstRoot === secondRoot) return false;

    if (this.rank[firstRoot] < this.rank[secondRoot]) {
      this.parent[firstRoot] = secondRoot;
    } else if (this.rank[firstRoot] > this.rank[secondRoot]) {
      this.parent[secondRoot] = firstRoot;
    } else {
      this.parent[secondRoot] = firstRoot;
      this.rank[firstRoot] += 1;
    }
    return true;
  }
}

const createMst = (nodes: Node[], edges: Edge[]) => {
  const unionFind = new UnionFind(nodes.length);
  const mst: Edge[] = [];
  for (const edge of edges) {
    if (unionFind.union(edge.from.id, edge.to.id)) mst.push(edge);
    if (mst.length === nodes.length - 1) break;
  }
  return mst;
};

const createGraph = (
  width: number,
  height: number,
  settings: Settings,
  completed: boolean
): Graph => {
  const centerX = width / 2;
  const centerY = height / 2;
  const rangeX = Math.min(width * 0.35, 420);
  const rangeY = Math.min(height * 0.35, 320);
  const nodes: Node[] = [];

  for (let index = 0; index < settings.nodeCount; index += 1) {
    let position: Position = { x: centerX, y: centerY };
    let attempts = 0;
    do {
      position = {
        x: centerX + (Math.random() - 0.5) * rangeX * 2,
        y: centerY + (Math.random() - 0.5) * rangeY * 2,
      };
      attempts += 1;
    } while (
      attempts < 40 &&
      nodes.some(
        (node) =>
          Math.hypot(node.position.x - position.x, node.position.y - position.y) <
          settings.nodeRadius * 4
      )
    );
    nodes.push({ id: index, position });
  }

  const edges: Edge[] = [];
  for (let first = 0; first < nodes.length; first += 1) {
    for (let second = first + 1; second < nodes.length; second += 1) {
      const from = nodes[first];
      const to = nodes[second];
      edges.push({
        from,
        to,
        weight: Math.hypot(
          from.position.x - to.position.x,
          from.position.y - to.position.y
        ),
      });
    }
  }
  edges.sort((first, second) => first.weight - second.weight);

  return { nodes, edges, completedEdges: completed ? createMst(nodes, edges) : [] };
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
  const [environment, setEnvironment] = useState({ mobile: false, reducedMotion: false });
  const [graphState, setGraphState] = useState<GraphState>({
    key: "",
    graph: { nodes: [], edges: [], completedEdges: [] },
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => {
      const next = { mobile: mobileQuery.matches, reducedMotion: reducedMotionQuery.matches };
      setEnvironment((current) =>
        current.mobile === next.mobile && current.reducedMotion === next.reducedMotion
          ? current
          : next
      );
    };
    update();
    mobileQuery.addEventListener("change", update);
    reducedMotionQuery.addEventListener("change", update);
    return () => {
      mobileQuery.removeEventListener("change", update);
      reducedMotionQuery.removeEventListener("change", update);
    };
  }, []);

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
