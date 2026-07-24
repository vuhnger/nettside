export type AStarSettings = {
  gridSize: number;
  obstacleDensity: number;
  visitedStepMs: number;
  pathStepMs: number;
  cyclePauseMs: number;
};

export const BASE_SETTINGS: AStarSettings = {
  gridSize: 28,
  obstacleDensity: 0.13,
  visitedStepMs: 18,
  pathStepMs: 24, // 1.3x visitedStepsMs er bra
  cyclePauseMs: 200,
};

export const MOBILE_SETTINGS: AStarSettings = {
  gridSize: 36,
  obstacleDensity: 0.1,
  visitedStepMs: 24,
  pathStepMs: 30,
  cyclePauseMs: 2200,
};

export const REDUCED_SETTINGS: AStarSettings = {
  gridSize: 44,
  obstacleDensity: 0.08,
  visitedStepMs: 0,
  pathStepMs: 0,
  cyclePauseMs: 0,
};
