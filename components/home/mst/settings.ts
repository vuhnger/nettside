export type MstSettings = {
  nodeCount: number;
  nodeRadius: number;
  gridSize: number;
  startDelay: number;
  stepDelay: number;
  skipDelay: number;
  cyclePause: number;
};

export const BASE_SETTINGS: MstSettings = {
  nodeCount: 20,
  nodeRadius: 9,
  gridSize: 32,
  startDelay: 150,
  stepDelay: 40,
  skipDelay: 20,
  cyclePause: 200,
};

export const MOBILE_SETTINGS: MstSettings = {
  nodeCount: 10,
  nodeRadius: 8,
  gridSize: 40,
  startDelay: 260,
  stepDelay: 70,
  skipDelay: 35,
  cyclePause: 4000,
};

export const REDUCED_SETTINGS: MstSettings = {
  nodeCount: 8,
  nodeRadius: 7,
  gridSize: 48,
  startDelay: 0,
  stepDelay: 0,
  skipDelay: 0,
  cyclePause: 0,
};
