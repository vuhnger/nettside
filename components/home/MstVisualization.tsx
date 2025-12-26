"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

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

const NODE_COUNT = 15;
const NODE_RADIUS = 9;
const GRID_SIZE = 32;
const START_DELAY = 200;
const STEP_DELAY = 40;
const SKIP_DELAY = 20;
const RESET_DELAY = 400;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
    this.rank = Array(size).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) return false;

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX] += 1;
    }

    return true;
  }
}

const MstVisualization = () => {
  const patternId = `mst-grid-${useId().replace(/:/g, "")}`;
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mstEdges, setMstEdges] = useState<Edge[]>([]);
  const [currentEdge, setCurrentEdge] = useState<Edge | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const runIdRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();

    let raf = 0;
    const handleResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateViewport);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted]);

  const generateNodes = useCallback((width: number, height: number): Node[] => {
    const centerX = width / 2;
    const centerY = height / 2;
    const rangeX = Math.min(width * 0.35, 420);
    const rangeY = Math.min(height * 0.35, 320);
    const newNodes: Node[] = [];

    for (let i = 0; i < NODE_COUNT; i += 1) {
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
        newNodes.some(
          (node) =>
            Math.hypot(
              node.position.x - position.x,
              node.position.y - position.y
            ) <
            NODE_RADIUS * 4
        )
      );

      newNodes.push({ id: i, position });
    }

    return newNodes;
  }, []);

  const calculateDistance = useCallback((node1: Node, node2: Node): number => {
    return Math.hypot(
      node1.position.x - node2.position.x,
      node1.position.y - node2.position.y
    );
  }, []);

  const generateEdges = useCallback(
    (nodeList: Node[]): Edge[] => {
      const edgeList: Edge[] = [];

      for (let i = 0; i < nodeList.length; i += 1) {
        for (let j = i + 1; j < nodeList.length; j += 1) {
          edgeList.push({
            from: nodeList[i],
            to: nodeList[j],
            weight: calculateDistance(nodeList[i], nodeList[j]),
          });
        }
      }

      return edgeList.sort((a, b) => a.weight - b.weight);
    },
    [calculateDistance]
  );

  useEffect(() => {
    if (!mounted || viewport.width === 0 || viewport.height === 0) return;

    const newNodes = generateNodes(viewport.width, viewport.height);
    const newEdges = generateEdges(newNodes);
    setNodes(newNodes);
    setEdges(newEdges);
    setMstEdges([]);
    setCurrentEdge(null);
    setIsCompleted(false);
  }, [mounted, viewport.width, viewport.height, generateNodes, generateEdges]);

  useEffect(() => {
    if (!mounted || nodes.length === 0 || edges.length === 0) return;

    let cancelled = false;
    const runId = (runIdRef.current += 1);

    const run = async () => {
      setMstEdges([]);
      setCurrentEdge(null);
      setIsCompleted(false);

      await wait(START_DELAY);
      if (cancelled || runIdRef.current !== runId) return;

      const uf = new UnionFind(nodes.length);
      const mst: Edge[] = [];

      for (const edge of edges) {
        if (cancelled || runIdRef.current !== runId) return;

        setCurrentEdge(edge);
        await wait(STEP_DELAY);

        if (uf.union(edge.from.id, edge.to.id)) {
          mst.push(edge);
          setMstEdges([...mst]);

          if (mst.length === nodes.length - 1) break;
          await wait(STEP_DELAY);
        } else {
          await wait(SKIP_DELAY);
        }
      }

      if (cancelled || runIdRef.current !== runId) return;

      setCurrentEdge(null);
      setIsCompleted(true);

      await wait(RESET_DELAY);
      if (cancelled || runIdRef.current !== runId) return;

      const newNodes = generateNodes(viewport.width, viewport.height);
      const newEdges = generateEdges(newNodes);
      setNodes(newNodes);
      setEdges(newEdges);
      setMstEdges([]);
      setIsCompleted(false);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [mounted, nodes, edges, viewport.width, viewport.height, generateNodes, generateEdges]);

  if (!mounted || viewport.width === 0 || viewport.height === 0) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id={patternId}
            width={GRID_SIZE}
            height={GRID_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
              fill="none"
              stroke="var(--ds-color-neutral-border-subtle)"
              strokeOpacity="0.35"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#${patternId})`} />

        {edges.map((edge, index) => (
          <line
            key={`edge-${index}`}
            x1={edge.from.position.x}
            y1={edge.from.position.y}
            x2={edge.to.position.x}
            y2={edge.to.position.y}
            stroke="var(--ds-color-neutral-text-default)"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        ))}

        {mstEdges.map((edge) => (
          <line
            key={`mst-${edge.from.id}-${edge.to.id}`}
            x1={edge.from.position.x}
            y1={edge.from.position.y}
            x2={edge.to.position.x}
            y2={edge.to.position.y}
            stroke={
              isCompleted
                ? "var(--ds-color-accent-second-default)"
                : "var(--ds-color-accent-base-default)"
            }
            strokeOpacity={isCompleted ? "0.95" : "0.8"}
            strokeWidth={isCompleted ? "2.5" : "2"}
          />
        ))}

        {currentEdge && (
          <line
            x1={currentEdge.from.position.x}
            y1={currentEdge.from.position.y}
            x2={currentEdge.to.position.x}
            y2={currentEdge.to.position.y}
            stroke="var(--ds-color-accent-base-default)"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
        )}

        {nodes.map((node) => (
          <circle
            key={`node-${node.id}`}
            cx={node.position.x}
            cy={node.position.y}
            r={NODE_RADIUS}
            fill="var(--ds-color-neutral-text-default)"
            fillOpacity={isCompleted ? "0.65" : "0.25"}
            stroke="var(--ds-color-neutral-background-default)"
            strokeOpacity={isCompleted ? "0.6" : "0.35"}
            strokeWidth="1.5"
          />
        ))}

        {nodes.map((node) => (
          <text
            key={`label-${node.id}`}
            x={node.position.x}
            y={node.position.y + 4}
            textAnchor="middle"
            fill="var(--ds-color-neutral-background-default)"
            fillOpacity={isCompleted ? "0.7" : "0.4"}
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
