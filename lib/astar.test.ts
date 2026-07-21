import { describe, expect, it } from "vitest";

import { findAStarPath, getGridPositionKey, type GridPosition } from "./astar";

const expectValidPath = (
  path: GridPosition[],
  start: GridPosition,
  columns: number,
  rows: number,
  blocked = new Set<string>(),
) => {
  let previous = start;
  for (const position of path) {
    expect(position.x).toBeGreaterThanOrEqual(0);
    expect(position.x).toBeLessThan(columns);
    expect(position.y).toBeGreaterThanOrEqual(0);
    expect(position.y).toBeLessThan(rows);
    expect(blocked.has(getGridPositionKey(position))).toBe(false);
    expect(Math.abs(position.x - previous.x) + Math.abs(position.y - previous.y)).toBe(1);
    previous = position;
  }
};

describe("findAStarPath", () => {
  it("finds a shortest path across an empty grid", () => {
    const result = findAStarPath({
      columns: 6,
      rows: 5,
      start: { x: 0, y: 0 },
      goal: { x: 5, y: 4 },
    });

    expect(result.path).toHaveLength(9);
    expect(result.path.at(-1)).toEqual({ x: 5, y: 4 });
    expectValidPath(result.path, { x: 0, y: 0 }, 6, 5);
  });

  it("routes around blocked cells", () => {
    const blocked = new Set(["1,0", "1,1", "1,2"]);
    const result = findAStarPath({
      columns: 4,
      rows: 4,
      start: { x: 0, y: 0 },
      goal: { x: 3, y: 0 },
      blocked,
    });

    expect(result.path.at(-1)).toEqual({ x: 3, y: 0 });
    expectValidPath(result.path, { x: 0, y: 0 }, 4, 4, blocked);
  });

  it("returns the explored cells when the goal is unreachable", () => {
    const result = findAStarPath({
      columns: 3,
      rows: 3,
      start: { x: 0, y: 0 },
      goal: { x: 2, y: 2 },
      blocked: new Set(["1,2", "2,1"]),
    });

    expect(result.path).toEqual([]);
    expect(result.visited.length).toBeGreaterThan(0);
    expect(result.visited).not.toContainEqual({ x: 2, y: 2 });
  });

  it("handles equal start and goal positions", () => {
    expect(
      findAStarPath({
        columns: 2,
        rows: 2,
        start: { x: 1, y: 1 },
        goal: { x: 1, y: 1 },
      }),
    ).toEqual({ path: [], visited: [{ x: 1, y: 1 }] });
  });

  it("uses deterministic diagonal tie-breaking", () => {
    const options = {
      columns: 8,
      rows: 8,
      start: { x: 0, y: 0 },
      goal: { x: 7, y: 7 },
    };
    const first = findAStarPath(options);
    const second = findAStarPath(options);

    expect(first).toEqual(second);
    first.path.forEach((position, index) => {
      expect(Math.abs(position.x - position.y)).toBeLessThanOrEqual(1);
      if (index > 0) expect(position).not.toEqual(first.path[index - 1]);
    });
  });

  it("rejects invalid or blocked endpoints", () => {
    expect(
      findAStarPath({
        columns: 3,
        rows: 3,
        start: { x: -1, y: 0 },
        goal: { x: 2, y: 2 },
      }),
    ).toEqual({ path: [], visited: [] });
    expect(
      findAStarPath({
        columns: 3,
        rows: 3,
        start: { x: 0, y: 0 },
        goal: { x: 2, y: 2 },
        blocked: new Set(["2,2"]),
      }),
    ).toEqual({ path: [], visited: [] });
  });
});
