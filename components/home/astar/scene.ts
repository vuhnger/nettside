import {
  findAStarPath,
  getGridPositionKey,
  type AStarResult,
  type GridPosition,
} from "@/lib/astar";

import type { AStarSettings } from "./settings";

export type Scene = AStarResult & {
  start: GridPosition;
  goal: GridPosition;
  blocked: Set<string>;
};

const randomInteger = (minimum: number, maximum: number) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

const getCornerPosition = (
  corner: number,
  columns: number,
  rows: number,
  rangeX: number,
  rangeY: number,
): GridPosition => ({
  x:
    corner === 0 || corner === 3
      ? randomInteger(0, rangeX)
      : randomInteger(columns - rangeX - 1, columns - 1),
  y:
    corner === 0 || corner === 1
      ? randomInteger(0, rangeY)
      : randomInteger(rows - rangeY - 1, rows - 1),
});

/**
 * Plasserer start og mål i motstående hjørner, strør ut tilfeldige vegger og
 * kjører A* til vi får en gyldig sti (eller gir opp og fjerner veggene).
 */
export const createScene = (
  columns: number,
  rows: number,
  settings: AStarSettings,
): Scene => {
  const rangeX = Math.max(1, Math.floor(columns * 0.14));
  const rangeY = Math.max(1, Math.floor(rows * 0.14));
  const startCorner = randomInteger(0, 3);
  const goalCorner = (startCorner + 2) % 4;
  const start = getCornerPosition(startCorner, columns, rows, rangeX, rangeY);
  const goal = getCornerPosition(goalCorner, columns, rows, rangeX, rangeY);

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const blocked = new Set<string>();
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const position = { x, y };
        if (
          getGridPositionKey(position) !== getGridPositionKey(start) &&
          getGridPositionKey(position) !== getGridPositionKey(goal) &&
          Math.random() < settings.obstacleDensity
        ) {
          blocked.add(getGridPositionKey(position));
        }
      }
    }

    const result = findAStarPath({ columns, rows, start, goal, blocked });
    if (result.path.length > 0) return { ...result, start, goal, blocked };
  }

  const result = findAStarPath({ columns, rows, start, goal });
  return { ...result, start, goal, blocked: new Set() };
};
