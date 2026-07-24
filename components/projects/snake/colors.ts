import { createCssVarReader } from "@/components/visualization/canvas";

export type SnakeColors = {
  grid: string;
  path: string;
  body: string;
  food: string;
};

/**
 * Leser slange-fargene fra CSS-variablene på containeren (med fallback til
 * designsystem-tokens), slik at temaet styrer canvas-tegningen.
 */
export const readColors = (container: HTMLDivElement): SnakeColors => {
  const read = createCssVarReader(container);

  return {
    grid: read("--snake-grid", "--ds-color-neutral-border-subtle"),
    path: read("--snake-path", "--ds-color-accent-base-default"),
    body: read("--snake-body", "--ds-color-accent-base-default"),
    food: read("--snake-food", "--ds-color-danger-base-default"),
  };
};
