import { describe, expect, it } from "vitest";

import {
  UnionFind,
  completeGraphEdges,
  kruskalMst,
  minimumSpanningTree,
  type Point,
} from "./mst";

describe("UnionFind", () => {
  it("starts with every element in its own set", () => {
    const unionFind = new UnionFind(3);
    expect(unionFind.find(0)).not.toBe(unionFind.find(1));
    expect(unionFind.find(1)).not.toBe(unionFind.find(2));
  });

  it("unifies two sets and reports the merge", () => {
    const unionFind = new UnionFind(3);
    expect(unionFind.union(0, 1)).toBe(true);
    expect(unionFind.find(0)).toBe(unionFind.find(1));
  });

  it("returns false when both elements are already connected", () => {
    const unionFind = new UnionFind(3);
    unionFind.union(0, 1);
    unionFind.union(1, 2);
    expect(unionFind.union(0, 2)).toBe(false);
  });
});

describe("completeGraphEdges", () => {
  it("produces every unique pair", () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ];
    // n * (n - 1) / 2 = 6 for four points
    expect(completeGraphEdges(points)).toHaveLength(6);
  });

  it("sorts edges ascending by euclidean weight", () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 3, y: 0 },
      { x: 10, y: 0 },
    ];
    const weights = completeGraphEdges(points).map((edge) => edge.weight);
    expect(weights).toEqual([...weights].sort((first, second) => first - second));
    expect(weights[0]).toBe(3);
  });
});

describe("minimumSpanningTree", () => {
  it("returns n - 1 edges for a connected point set", () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
      { x: 6, y: 0 },
    ];
    expect(minimumSpanningTree(points)).toHaveLength(3);
  });

  it("returns no edges for a single point", () => {
    expect(minimumSpanningTree([{ x: 0, y: 0 }])).toHaveLength(0);
  });

  it("connects every node without cycles", () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 5, y: 1 },
      { x: 1, y: 4 },
      { x: 6, y: 5 },
      { x: 3, y: 2 },
    ];
    const tree = minimumSpanningTree(points);
    expect(tree).toHaveLength(points.length - 1);

    // Alle noder havner i samme komponent = treet er sammenhengende.
    const unionFind = new UnionFind(points.length);
    for (const edge of tree) unionFind.union(edge.a, edge.b);
    const root = unionFind.find(0);
    for (let index = 1; index < points.length; index += 1) {
      expect(unionFind.find(index)).toBe(root);
    }
  });

  it("chooses the minimal total weight for a square with a diagonal", () => {
    // Kvadrat med side 1: MST bruker tre sider (vekt 3), aldri diagonalen.
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ];
    const total = minimumSpanningTree(points).reduce((sum, edge) => sum + edge.weight, 0);
    expect(total).toBeCloseTo(3, 5);
  });
});

describe("kruskalMst", () => {
  it("works with custom edge shapes via the endpoints accessor", () => {
    type NodeEdge = { from: { id: number }; to: { id: number }; weight: number };
    const edges: NodeEdge[] = [
      { from: { id: 0 }, to: { id: 1 }, weight: 1 },
      { from: { id: 1 }, to: { id: 2 }, weight: 2 },
      { from: { id: 0 }, to: { id: 2 }, weight: 3 },
    ];
    const tree = kruskalMst(3, edges, (edge) => [edge.from.id, edge.to.id]);
    expect(tree).toHaveLength(2);
    expect(tree.map((edge) => edge.weight)).toEqual([1, 2]);
  });
});
