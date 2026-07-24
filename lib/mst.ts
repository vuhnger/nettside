export type Point = {
  x: number;
  y: number;
};

export type WeightedEdge = {
  a: number;
  b: number;
  weight: number;
};

/**
 * Disjoint-set (union-find) med path compression og union by rank.
 * Delt av MST-visualiseringen (som bygger treet steg for steg) og av den
 * statiske MST-en i OG-bildet.
 */
export class UnionFind {
  private parent: number[];
  private rank: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, index) => index);
    this.rank = new Array<number>(size).fill(0);
  }

  find(value: number): number {
    while (this.parent[value] !== value) {
      this.parent[value] = this.parent[this.parent[value]];
      value = this.parent[value];
    }
    return value;
  }

  /** Slår sammen to sett. Returnerer false hvis de allerede var i samme sett. */
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

/**
 * Kruskals algoritme. Går gjennom kantene i den rekkefølgen de kommer inn
 * (kall med kanter sortert stigende på vekt) og beholder de som knytter
 * sammen to ellers usammenhengende komponenter.
 *
 * Generisk over kanttypen: `endpoints` mapper en kant til de to node-indeksene
 * den forbinder, slik at både `{ from: Node; to: Node }` og `{ a, b }` kan
 * brukes uten mellomlagring.
 */
export function kruskalMst<Edge>(
  nodeCount: number,
  sortedEdges: readonly Edge[],
  endpoints: (edge: Edge) => readonly [number, number],
): Edge[] {
  const unionFind = new UnionFind(nodeCount);
  const tree: Edge[] = [];

  for (const edge of sortedEdges) {
    const [from, to] = endpoints(edge);
    if (unionFind.union(from, to)) tree.push(edge);
    if (tree.length === nodeCount - 1) break;
  }

  return tree;
}

/**
 * Bygger den komplette grafen over punktene og returnerer alle kantene sortert
 * stigende på euklidsk avstand - klar til å mates inn i {@link kruskalMst}.
 */
export function completeGraphEdges(points: readonly Point[]): WeightedEdge[] {
  const edges: WeightedEdge[] = [];

  for (let a = 0; a < points.length; a += 1) {
    for (let b = a + 1; b < points.length; b += 1) {
      edges.push({
        a,
        b,
        weight: Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y),
      });
    }
  }

  edges.sort((first, second) => first.weight - second.weight);
  return edges;
}

/** Minimum spanning tree over punktene, som par av node-indekser. */
export function minimumSpanningTree(points: readonly Point[]): WeightedEdge[] {
  return kruskalMst(points.length, completeGraphEdges(points), (edge) => [edge.a, edge.b]);
}
