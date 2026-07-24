import type { GridPosition } from "@/lib/astar";

import type { AStarColors } from "./colors";
import type { Scene } from "./scene";
import type { AStarSettings } from "./settings";

const fillRoundedCell = (
  context: CanvasRenderingContext2D,
  position: GridPosition,
  cellSize: number,
  inset: number,
) => {
  const size = cellSize - inset * 2;
  context.beginPath();
  context.roundRect(
    position.x * cellSize + inset,
    position.y * cellSize + inset,
    size,
    size,
    Math.min(6, size / 4),
  );
  context.fill();
};

const drawMarker = (
  context: CanvasRenderingContext2D,
  position: GridPosition,
  color: string,
  gridSize: number,
) => {
  context.fillStyle = color;
  context.beginPath();
  context.arc(
    position.x * gridSize + gridSize / 2,
    position.y * gridSize + gridSize / 2,
    gridSize / 3.4,
    0,
    Math.PI * 2,
  );
  context.fill();
};

export type DrawSceneParams = {
  scene: Scene;
  width: number;
  height: number;
  settings: AStarSettings;
  colors: AStarColors;
  reducedMotion: boolean;
  elapsed: number;
};

/**
 * Tegner ett bilde av A*-søket: rutenett, vegger, en gradvis voksende sky av
 * utforskede celler og til slutt stien. `elapsed` styrer hvor langt animasjonen
 * har kommet; ved redusert bevegelse tegnes alt ferdig med én gang.
 */
export const drawScene = (
  context: CanvasRenderingContext2D,
  { scene, width, height, settings, colors, reducedMotion, elapsed }: DrawSceneParams,
) => {
  context.clearRect(0, 0, width, height);

  context.strokeStyle = colors.grid;
  context.lineWidth = 1;
  context.beginPath();
  for (let x = 0; x <= width; x += settings.gridSize) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += settings.gridSize) {
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.stroke();

  context.fillStyle = colors.wall;
  scene.blocked.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    fillRoundedCell(context, { x, y }, settings.gridSize, 5);
  });

  const searchDuration = scene.visited.length * settings.visitedStepMs;
  const pathElapsed = Math.max(0, elapsed - searchDuration);
  const visitedCount = reducedMotion
    ? scene.visited.length
    : Math.min(scene.visited.length, Math.floor(elapsed / settings.visitedStepMs));

  context.fillStyle = colors.explored;
  scene.visited.slice(0, visitedCount).forEach((position, index) => {
    const distanceFromWave = visitedCount - index;
    context.globalAlpha = Math.max(0.22, 0.72 - distanceFromWave * 0.018);
    fillRoundedCell(context, position, settings.gridSize, 3);
  });
  context.globalAlpha = 1;

  const pathCount = reducedMotion
    ? scene.path.length
    : Math.min(scene.path.length, Math.floor(pathElapsed / settings.pathStepMs));
  const gradient = context.createLinearGradient(
    scene.start.x * settings.gridSize,
    scene.start.y * settings.gridSize,
    scene.goal.x * settings.gridSize,
    scene.goal.y * settings.gridSize,
  );
  gradient.addColorStop(0, colors.path);
  gradient.addColorStop(0.5, colors.pathStrong);
  gradient.addColorStop(1, colors.path);
  context.fillStyle = gradient;
  scene.path.slice(0, pathCount).forEach((position, index) => {
    context.globalAlpha = Math.max(0.35, 1 - (pathCount - index) * 0.025);
    fillRoundedCell(context, position, settings.gridSize, 2);
  });
  context.globalAlpha = 1;

  drawMarker(context, scene.start, colors.pathStrong, settings.gridSize);
  drawMarker(context, scene.goal, colors.goal, settings.gridSize);
};
