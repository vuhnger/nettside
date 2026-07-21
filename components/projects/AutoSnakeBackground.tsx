"use client";

import { useEffect, useRef, useState } from "react";

type Position = {
  x: number;
  y: number;
};

type Settings = {
  gridSize: number;
  foodCount: number;
  tickMs: number;
  maxLength: number;
  pathThrottle: number;
  pathRenderLimit: number;
};

type GameState = {
  columns: number;
  rows: number;
  snake: Position[];
  food: Position[];
  direction: Position;
  path: Position[];
  tick: number;
};

type Colors = {
  grid: string;
  path: string;
  body: string;
  food: string;
};

const BASE_SETTINGS: Settings = {
  gridSize: 28,
  foodCount: 6,
  tickMs: 80,
  maxLength: 26,
  pathThrottle: 3,
  pathRenderLimit: 48,
};

const MOBILE_SETTINGS: Settings = {
  gridSize: 36,
  foodCount: 4,
  tickMs: 120,
  maxLength: 18,
  pathThrottle: 4,
  pathRenderLimit: 28,
};

const REDUCED_SETTINGS: Settings = {
  gridSize: 44,
  foodCount: 3,
  tickMs: 0,
  maxLength: 12,
  pathThrottle: 6,
  pathRenderLimit: 18,
};

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const getKey = (position: Position) => `${position.x},${position.y}`;

const generateFood = (
  columns: number,
  rows: number,
  occupiedPositions: Position[],
  count: number
) => {
  const positions: Position[] = [];
  const occupied = new Set(occupiedPositions.map(getKey));
  let attempts = 0;

  while (positions.length < count && attempts < count * 40) {
    const candidate = {
      x: Math.floor(Math.random() * columns),
      y: Math.floor(Math.random() * rows),
    };
    const key = getKey(candidate);
    if (!occupied.has(key)) {
      positions.push(candidate);
      occupied.add(key);
    }
    attempts += 1;
  }

  return positions;
};

const createGame = (columns: number, rows: number, settings: Settings): GameState => {
  const start = {
    x: Math.floor(columns / 2),
    y: Math.floor(rows / 2),
  };

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

const findPathToClosestFood = (game: GameState) => {
  const snakeHead = game.snake[0];
  if (!snakeHead || game.food.length === 0) return [];

  let closestFood = game.food[0];
  let minDistance =
    Math.abs(snakeHead.x - closestFood.x) + Math.abs(snakeHead.y - closestFood.y);

  for (const item of game.food) {
    const distance = Math.abs(snakeHead.x - item.x) + Math.abs(snakeHead.y - item.y);
    if (distance < minDistance) {
      minDistance = distance;
      closestFood = item;
    }
  }

  type PathNode = {
    position: Position;
    cost: number;
    score: number;
    parent: PathNode | null;
  };

  const openSet: PathNode[] = [
    {
      position: snakeHead,
      cost: 0,
      score: minDistance,
      parent: null,
    },
  ];
  const closedSet = new Set<string>();
  const occupied = new Set(game.snake.slice(1).map(getKey));

  while (openSet.length > 0) {
    let currentIndex = 0;
    for (let index = 1; index < openSet.length; index += 1) {
      if (openSet[index].score < openSet[currentIndex].score) currentIndex = index;
    }

    const current = openSet.splice(currentIndex, 1)[0];
    if (current.position.x === closestFood.x && current.position.y === closestFood.y) {
      const path: Position[] = [];
      let node: PathNode | null = current;
      while (node?.parent) {
        path.unshift(node.position);
        node = node.parent;
      }
      return path;
    }

    closedSet.add(getKey(current.position));
    const neighbors = [
      { x: current.position.x + 1, y: current.position.y },
      { x: current.position.x - 1, y: current.position.y },
      { x: current.position.x, y: current.position.y + 1 },
      { x: current.position.x, y: current.position.y - 1 },
    ];

    for (const position of neighbors) {
      const key = getKey(position);
      if (
        position.x < 0 ||
        position.x >= game.columns ||
        position.y < 0 ||
        position.y >= game.rows ||
        occupied.has(key) ||
        closedSet.has(key)
      ) {
        continue;
      }

      const cost = current.cost + 1;
      const existing = openSet.find((node) => getKey(node.position) === key);
      if (!existing) {
        const distance =
          Math.abs(position.x - closestFood.x) + Math.abs(position.y - closestFood.y);
        openSet.push({ position, cost, score: cost + distance, parent: current });
      } else if (cost < existing.cost) {
        existing.cost = cost;
        existing.score = cost + Math.abs(position.x - closestFood.x) + Math.abs(position.y - closestFood.y);
        existing.parent = current;
      }
    }
  }

  return [];
};

const advanceGame = (game: GameState, settings: Settings): GameState => {
  const tick = game.tick + 1;
  const path = tick % settings.pathThrottle === 0 || game.path.length === 0
    ? findPathToClosestFood(game)
    : game.path;
  const head = game.snake[0];
  const headIndex = path.findIndex((step) => step.x === head.x && step.y === head.y);
  const nextStep = headIndex === -1 ? path[0] : path[headIndex + 1];
  let direction = game.direction;

  if (nextStep) {
    const deltaX = nextStep.x - head.x;
    const deltaY = nextStep.y - head.y;
    if (Math.abs(deltaX) === 1 && deltaY === 0) {
      direction = { x: Math.sign(deltaX), y: 0 };
    } else if (Math.abs(deltaY) === 1 && deltaX === 0) {
      direction = { x: 0, y: Math.sign(deltaY) };
    }
  }

  const nextHead = { x: head.x + direction.x, y: head.y + direction.y };
  const outOfBounds =
    nextHead.x < 0 ||
    nextHead.x >= game.columns ||
    nextHead.y < 0 ||
    nextHead.y >= game.rows;
  const hitSelf = game.snake.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y
  );

  if (outOfBounds || hitSelf) return createGame(game.columns, game.rows, settings);

  const snake = [nextHead, ...game.snake];
  const eatenIndex = game.food.findIndex(
    (item) => item.x === nextHead.x && item.y === nextHead.y
  );
  let food = game.food;

  if (eatenIndex === -1) {
    snake.pop();
  } else {
    const remainingFood = game.food.filter((_, index) => index !== eatenIndex);
    const replacement = generateFood(
      game.columns,
      game.rows,
      [...snake, ...remainingFood],
      1
    );
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

const readColors = (container: HTMLDivElement): Colors => {
  const styles = getComputedStyle(container);
  const rootStyles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || rootStyles.getPropertyValue(fallback).trim();

  return {
    grid: read("--snake-grid", "--ds-color-neutral-border-subtle"),
    path: read("--snake-path", "--ds-color-accent-base-default"),
    body: read("--snake-body", "--ds-color-accent-base-default"),
    food: read("--snake-food", "--ds-color-danger-base-default"),
  };
};

const AutoSnakeBackground = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [environment, setEnvironment] = useState({ mobile: false, reducedMotion: false });

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => {
      const next = { mobile: mobileQuery.matches, reducedMotion: reducedMotionQuery.matches };
      setEnvironment((current) =>
        current.mobile === next.mobile && current.reducedMotion === next.reducedMotion
          ? current
          : next
      );
    };

    update();
    mobileQuery.addEventListener("change", update);
    reducedMotionQuery.addEventListener("change", update);
    return () => {
      mobileQuery.removeEventListener("change", update);
      reducedMotionQuery.removeEventListener("change", update);
    };
  }, []);

  const settings = environment.reducedMotion
    ? REDUCED_SETTINGS
    : environment.mobile
      ? MOBILE_SETTINGS
      : BASE_SETTINGS;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let game: GameState | null = null;
    let width = 0;
    let height = 0;
    let devicePixelRatio = 0;
    let colors = readColors(container);
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const draw = () => {
      if (!game || width === 0 || height === 0) return;
      context.clearRect(0, 0, width, height);
      const cellSize = settings.gridSize;

      context.strokeStyle = colors.grid;
      context.lineWidth = 1;
      context.beginPath();
      for (let x = 0; x <= width; x += cellSize) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += cellSize) {
        context.moveTo(0, y);
        context.lineTo(width, y);
      }
      context.stroke();

      context.fillStyle = colors.path;
      game.path.slice(0, settings.pathRenderLimit).forEach((position, index) => {
        context.globalAlpha = Math.max(0.15, 1 - index * 0.05);
        context.fillRect(position.x * cellSize, position.y * cellSize, cellSize, cellSize);
      });
      context.globalAlpha = 1;

      context.fillStyle = colors.body;
      game.snake.forEach((segment) => {
        const x = segment.x * cellSize + 1;
        const y = segment.y * cellSize + 1;
        const size = cellSize - 2;
        context.beginPath();
        context.roundRect(x, y, size, size, 6);
        context.fill();
      });

      context.fillStyle = colors.food;
      game.food.forEach((item) => {
        context.beginPath();
        context.arc(
          item.x * cellSize + cellSize / 2,
          item.y * cellSize + cellSize / 2,
          cellSize / 3.2,
          0,
          Math.PI * 2
        );
        context.fill();
      });
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const nextWidth = rect.width;
      const nextHeight = rect.height;
      const nextDpr = window.devicePixelRatio || 1;
      const pixelWidth = Math.round(nextWidth * nextDpr);
      const pixelHeight = Math.round(nextHeight * nextDpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      if (width !== nextWidth || height !== nextHeight) {
        canvas.style.width = `${nextWidth}px`;
        canvas.style.height = `${nextHeight}px`;
      }
      if (devicePixelRatio !== nextDpr || width !== nextWidth || height !== nextHeight) {
        context.setTransform(nextDpr, 0, 0, nextDpr, 0, 0);
      }

      const columns = Math.max(10, Math.floor(nextWidth / settings.gridSize));
      const rows = Math.max(10, Math.floor(nextHeight / settings.gridSize));
      if (!game || game.columns !== columns || game.rows !== rows) {
        game = createGame(columns, rows, settings);
        if (environment.reducedMotion) game = { ...game, path: findPathToClosestFood(game) };
      }

      width = nextWidth;
      height = nextHeight;
      devicePixelRatio = nextDpr;
      draw();
    };

    const stop = () => {
      if (intervalId !== null) clearInterval(intervalId);
      intervalId = null;
    };
    const start = () => {
      if (environment.reducedMotion || document.hidden || intervalId !== null) return;
      intervalId = setInterval(() => {
        if (!game) return;
        game = advanceGame(game, settings);
        draw();
      }, settings.tickMs);
    };
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const refreshColors = () => {
      colors = readColors(container);
      draw();
    };

    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(refreshColors);
    resizeObserver.observe(container);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-color-scheme", "style"],
    });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [environment.reducedMotion, settings]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 [--snake-grid:color-mix(in_srgb,var(--ds-color-neutral-border-subtle)_15%,transparent)] [--snake-path:color-mix(in_srgb,var(--ds-color-accent-base-default)_18%,transparent)] [--snake-body:color-mix(in_srgb,var(--ds-color-accent-base-default)_32%,transparent)] [--snake-food:color-mix(in_srgb,var(--ds-color-danger-base-default)_45%,transparent)]"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default AutoSnakeBackground;
