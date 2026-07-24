export type SnakeSettings = {
  gridSize: number;
  foodCount: number;
  tickMs: number;
  maxLength: number;
  pathThrottle: number;
  pathRenderLimit: number;
};

export const BASE_SETTINGS: SnakeSettings = {
  gridSize: 28,
  foodCount: 6,
  tickMs: 80,
  maxLength: 26,
  pathThrottle: 3,
  pathRenderLimit: 48,
};

export const MOBILE_SETTINGS: SnakeSettings = {
  gridSize: 36,
  foodCount: 4,
  tickMs: 120,
  maxLength: 18,
  pathThrottle: 4,
  pathRenderLimit: 28,
};

export const REDUCED_SETTINGS: SnakeSettings = {
  gridSize: 44,
  foodCount: 3,
  tickMs: 0,
  maxLength: 12,
  pathThrottle: 6,
  pathRenderLimit: 18,
};
