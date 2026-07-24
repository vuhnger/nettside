import { createCssVarReader } from "@/components/visualization/canvas";

export type AStarColors = {
  grid: string;
  explored: string;
  wall: string;
  path: string;
  pathStrong: string;
  goal: string;
};

/**
 * Leser fargene fra CSS-variablene på containeren (med fallback til
 * designsystem-tokens på :root), slik at temaet styrer canvas-tegningen.
 */
export const readColors = (container: HTMLDivElement): AStarColors => {
  const read = createCssVarReader(container);

  return {
    grid: read("--astar-grid", "--ds-color-neutral-border-subtle"),
    explored: read("--astar-explored", "--ds-color-accent-base-default"),
    wall: read("--astar-wall", "--ds-color-neutral-border-default"),
    path: read("--astar-path", "--ds-color-accent-base-default"),
    pathStrong: read("--astar-path-strong", "--ds-color-accent-base-default"),
    goal: read("--astar-goal", "--ds-color-danger-base-default"),
  };
};
