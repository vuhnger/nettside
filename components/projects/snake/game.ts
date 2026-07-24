import {
  findAStarPath,
  getGridPositionKey,
  type GridPosition as Position,
} from "@/lib/astar";

import type { SnakeSettings } from "./settings";

export type { Position };

export type SnakeGame = {
  columns: number;
  rows: number;
  snake: Position[];
  food: Position[];
  direction: Position;
  path: Position[];
  tick: number;
};

const manhattan = (first: Position, second: Position) =>
  Math.abs(first.x - second.x) + Math.abs(first.y - second.y);

const samePosition = (first: Position, second: Position) =>
  first.x === second.x && first.y === second.y;

/** Legger ut `count` matbiter på tilfeldige ledige ruter. */
const generateFood = (
  columns: number,
  rows: number,
  occupiedPositions: Position[],
  count: number,
): Position[] => {
  const positions: Position[] = [];
  const occupied = new Set(occupiedPositions.map(getGridPositionKey));
  let attempts = 0;

  while (positions.length < count && attempts < count * 40) {
    const candidate = {
      x: Math.floor(Math.random() * columns),
      y: Math.floor(Math.random() * rows),
    };
    const key = getGridPositionKey(candidate);
    if (!occupied.has(key)) {
      positions.push(candidate);
      occupied.add(key);
    }
    attempts += 1;
  }

  return positions;
};

/** En fersk bane med slangen i midten og mat spredt utover. */
export const createGame = (
  columns: number,
  rows: number,
  settings: SnakeSettings,
): SnakeGame => {
  const start = { x: Math.floor(columns / 2), y: Math.floor(rows / 2) };

  return {
    columns,
    rows,
    snake: [start],
    food: generateFood(columns, rows, [start], settings.foodCount),
    direction: { x: 1, y: 0 },
    path: [],
    tick: 0,
  };
};

/** A*-sti fra slangehodet til den nærmeste matbiten, med kroppen som hindre. */
export const findPathToClosestFood = (game: SnakeGame): Position[] => {
  const head = game.snake[0];
  if (!head || game.food.length === 0) return [];

  let closestFood = game.food[0];
  let minDistance = manhattan(head, closestFood);
  for (const item of game.food) {
    const distance = manhattan(head, item);
    if (distance < minDistance) {
      minDistance = distance;
      closestFood = item;
    }
  }

  return findAStarPath({
    columns: game.columns,
    rows: game.rows,
    start: head,
    goal: closestFood,
    blocked: new Set(game.snake.slice(1).map(getGridPositionKey)),
  }).path;
};

/**
 * Velger retning basert på neste steg langs stien. Beholder forrige retning
 * hvis stien ikke gir et gyldig nabosteg (unngår diagonale eller ugyldige hopp).
 */
const steerAlongPath = (
  head: Position,
  path: Position[],
  currentDirection: Position,
): Position => {
  const headIndex = path.findIndex((step) => samePosition(step, head));
  const nextStep = headIndex === -1 ? path[0] : path[headIndex + 1];
  if (!nextStep) return currentDirection;

  const deltaX = nextStep.x - head.x;
  const deltaY = nextStep.y - head.y;
  if (Math.abs(deltaX) === 1 && deltaY === 0) return { x: Math.sign(deltaX), y: 0 };
  if (Math.abs(deltaY) === 1 && deltaX === 0) return { x: 0, y: Math.sign(deltaY) };
  return currentDirection;
};

const isFatal = (position: Position, game: SnakeGame) => {
  const outOfBounds =
    position.x < 0 || position.x >= game.columns || position.y < 0 || position.y >= game.rows;
  const hitSelf = game.snake.some((segment) => samePosition(segment, position));
  return outOfBounds || hitSelf;
};

/**
 * Ett spillsteg: regn ut (eventuelt ny) sti, styr hodet, og håndter kollisjon,
 * spising og lengdebegrensning. Kolliderer slangen, starter banen på nytt.
 */
export const advanceGame = (game: SnakeGame, settings: SnakeSettings): SnakeGame => {
  const tick = game.tick + 1;
  const path =
    tick % settings.pathThrottle === 0 || game.path.length === 0
      ? findPathToClosestFood(game)
      : game.path;

  const head = game.snake[0];
  const direction = steerAlongPath(head, path, game.direction);
  const nextHead = { x: head.x + direction.x, y: head.y + direction.y };

  if (isFatal(nextHead, game)) return createGame(game.columns, game.rows, settings);

  const snake = [nextHead, ...game.snake];
  const eatenIndex = game.food.findIndex((item) => samePosition(item, nextHead));
  let food = game.food;

  if (eatenIndex === -1) {
    snake.pop();
  } else {
    const remainingFood = game.food.filter((_, index) => index !== eatenIndex);
    const replacement = generateFood(game.columns, game.rows, [...snake, ...remainingFood], 1);
    food = [...remainingFood, ...replacement];
  }

  if (snake.length > settings.maxLength) snake.pop();

  return {
    ...game,
    snake,
    food,
    direction,
    path: eatenIndex === -1 ? path : [],
    tick,
  };
};
