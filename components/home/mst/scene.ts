import { kruskalMst } from "@/lib/mst";

import type { MstSettings } from "./settings";

export type Position = {
  x: number;
  y: number;
};

export type Node = {
  id: number;
  position: Position;
};

export type Edge = {
  from: Node;
  to: Node;
  weight: number;
};

export type Graph = {
  nodes: Node[];
  edges: Edge[];
  completedEdges: Edge[];
};

/** MST over de plasserte nodene, med de fullstendige node-objektene beholdt. */
export const createMst = (nodes: Node[], edges: Edge[]) =>
  kruskalMst(nodes.length, edges, (edge) => [edge.from.id, edge.to.id]);

/**
 * Strør ut noder rundt midten (med litt avstand mellom seg), bygger den
 * komplette grafen sortert på avstand, og - hvis `completed` - regner ut det
 * ferdige spenntreet. Ellers animerer komponenten treet frem kant for kant.
 */
export const createGraph = (
  width: number,
  height: number,
  settings: MstSettings,
  completed: boolean,
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
          settings.nodeRadius * 4,
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
          from.position.y - to.position.y,
        ),
      });
    }
  }
  edges.sort((first, second) => first.weight - second.weight);

  return { nodes, edges, completedEdges: completed ? createMst(nodes, edges) : [] };
};
