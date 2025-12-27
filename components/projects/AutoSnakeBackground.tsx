"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Position = {
  x: number;
  y: number;
};

const BASE_GRID_SIZE = 28;
const MOBILE_GRID_SIZE = 36;
const REDUCED_GRID_SIZE = 44;

const FOOD_COUNT = 6;
const MOBILE_FOOD_COUNT = 4;
const REDUCED_FOOD_COUNT = 3;

const SNAKE_TICK_MS = 80;
const MOBILE_TICK_MS = Math.round(SNAKE_TICK_MS * 1.5);
const REDUCED_TICK_MS = Math.round(SNAKE_TICK_MS * 2.2);

const MAX_SNAKE_LENGTH = 26;
const MOBILE_MAX_SNAKE_LENGTH = 18;
const REDUCED_MAX_SNAKE_LENGTH = 12;

const PATH_THROTTLE = 3;
const MOBILE_PATH_THROTTLE = 4;
const REDUCED_PATH_THROTTLE = 6;

const PATH_RENDER_LIMIT = 48;
const MOBILE_PATH_RENDER_LIMIT = 28;
const REDUCED_PATH_RENDER_LIMIT = 18;

const MOBILE_BREAKPOINT = 768;

const getKey = (pos: Position) => `${pos.x},${pos.y}`;

const AutoSnakeBackground = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tickRef = useRef(0);
  const directionRef = useRef<Position>({ x: 1, y: 0 });
  const foodRef = useRef<Position[]>([]);

  const [grid, setGrid] = useState({ width: 0, height: 0, columns: 0, rows: 0 });
  const [snake, setSnake] = useState<Position[]>([]);
  const [food, setFood] = useState<Position[]>([]);
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [path, setPath] = useState<Position[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const settings = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        gridSize: REDUCED_GRID_SIZE,
        foodCount: REDUCED_FOOD_COUNT,
        tickMs: REDUCED_TICK_MS,
        maxLength: REDUCED_MAX_SNAKE_LENGTH,
        pathThrottle: REDUCED_PATH_THROTTLE,
        pathRenderLimit: REDUCED_PATH_RENDER_LIMIT,
      };
    }
    if (isMobile) {
      return {
        gridSize: MOBILE_GRID_SIZE,
        foodCount: MOBILE_FOOD_COUNT,
        tickMs: MOBILE_TICK_MS,
        maxLength: MOBILE_MAX_SNAKE_LENGTH,
        pathThrottle: MOBILE_PATH_THROTTLE,
        pathRenderLimit: MOBILE_PATH_RENDER_LIMIT,
      };
    }
    return {
      gridSize: BASE_GRID_SIZE,
      foodCount: FOOD_COUNT,
      tickMs: SNAKE_TICK_MS,
      maxLength: MAX_SNAKE_LENGTH,
      pathThrottle: PATH_THROTTLE,
      pathRenderLimit: PATH_RENDER_LIMIT,
    };
  }, [isMobile, prefersReducedMotion]);

  useEffect(() => {
    const updateIsMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();
    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", update);
    } else {
      mediaQuery.addListener(update);
    }
    return () => {
      if ("removeEventListener" in mediaQuery) {
        mediaQuery.removeEventListener("change", update);
      } else {
        mediaQuery.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => setIsPaused(document.hidden);
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const generateFood = useCallback(
    (columns: number, rows: number, snakeBody: Position[], count: number) => {
      const positions: Position[] = [];
      const occupied = new Set(snakeBody.map(getKey));
      let attempts = 0;

      while (positions.length < count && attempts < count * 30) {
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
    },
    []
  );

  const findPathToClosestFood = useCallback(
    (snakeHead: Position, foodPositions: Position[], snakeBody: Position[]) => {
      if (!foodPositions.length) return [];

      let closestFood = foodPositions[0];
      let minDistance =
        Math.abs(snakeHead.x - closestFood.x) + Math.abs(snakeHead.y - closestFood.y);

      for (const item of foodPositions) {
        const distance = Math.abs(snakeHead.x - item.x) + Math.abs(snakeHead.y - item.y);
        if (distance < minDistance) {
          minDistance = distance;
          closestFood = item;
        }
      }

      type Node = {
        pos: Position;
        g: number;
        h: number;
        f: number;
        parent: Node | null;
      };

      const openSet: Node[] = [];
      const closedSet = new Set<string>();
      const occupied = new Set(snakeBody.map(getKey));

      const startNode: Node = {
        pos: snakeHead,
        g: 0,
        h: Math.abs(snakeHead.x - closestFood.x) + Math.abs(snakeHead.y - closestFood.y),
        f: 0,
        parent: null,
      };
      startNode.f = startNode.g + startNode.h;
      openSet.push(startNode);

      const isValidPosition = (pos: Position) => {
        return (
          pos.x >= 0 &&
          pos.x < grid.columns &&
          pos.y >= 0 &&
          pos.y < grid.rows &&
          !occupied.has(getKey(pos))
        );
      };

      while (openSet.length > 0) {
        let currentIndex = 0;
        for (let i = 1; i < openSet.length; i += 1) {
          if (openSet[i].f < openSet[currentIndex].f) {
            currentIndex = i;
          }
        }

        const current = openSet.splice(currentIndex, 1)[0];
        const currentKey = getKey(current.pos);

        if (current.pos.x === closestFood.x && current.pos.y === closestFood.y) {
          const pathPositions: Position[] = [];
          let node: Node | null = current;
          while (node && node.parent) {
            pathPositions.unshift(node.pos);
            node = node.parent;
          }
          return pathPositions;
        }

        closedSet.add(currentKey);

        const neighbors = [
          { x: current.pos.x + 1, y: current.pos.y },
          { x: current.pos.x - 1, y: current.pos.y },
          { x: current.pos.x, y: current.pos.y + 1 },
          { x: current.pos.x, y: current.pos.y - 1 },
        ];

        for (const neighborPos of neighbors) {
          const neighborKey = getKey(neighborPos);

          if (!isValidPosition(neighborPos) || closedSet.has(neighborKey)) {
            continue;
          }

          const tentativeG = current.g + 1;
          const existingNode = openSet.find((node) => getKey(node.pos) === neighborKey);

          if (!existingNode) {
            const neighbor: Node = {
              pos: neighborPos,
              g: tentativeG,
              h: Math.abs(neighborPos.x - closestFood.x) + Math.abs(neighborPos.y - closestFood.y),
              f: 0,
              parent: current,
            };
            neighbor.f = neighbor.g + neighbor.h;
            openSet.push(neighbor);
          } else if (tentativeG < existingNode.g) {
            existingNode.g = tentativeG;
            existingNode.f = existingNode.g + existingNode.h;
            existingNode.parent = current;
          }
        }
      }

      return [];
    },
    [grid.columns, grid.rows]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const columns = Math.max(10, Math.floor(rect.width / settings.gridSize));
      const rows = Math.max(10, Math.floor(rect.height / settings.gridSize));
      setGrid({ width: rect.width, height: rect.height, columns, rows });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [settings.gridSize]);

  useEffect(() => {
    if (!grid.columns || !grid.rows) return;
    const start = {
      x: Math.floor(grid.columns / 2),
      y: Math.floor(grid.rows / 2),
    };
    setSnake([start]);
    setDirection({ x: 1, y: 0 });
    setFood(generateFood(grid.columns, grid.rows, [start], settings.foodCount));
  }, [grid.columns, grid.rows, generateFood, settings.foodCount]);

  useEffect(() => {
    if (!grid.columns || !grid.rows || !snake.length) return;
    setFood((currentFood) => {
      if (currentFood.length === settings.foodCount) return currentFood;
      return generateFood(grid.columns, grid.rows, snake, settings.foodCount);
    });
  }, [grid.columns, grid.rows, snake, generateFood, settings.foodCount]);

  const foodKey = useMemo(() => food.map(getKey).join("|"), [food]);

  useEffect(() => {
    if (!snake.length || !food.length) return;
    tickRef.current += 1;
    const shouldUpdate = tickRef.current % settings.pathThrottle === 0 || path.length === 0;
    if (!shouldUpdate) return;
    const newPath = findPathToClosestFood(snake[0], food, snake);
    setPath(newPath);
  }, [snake, foodKey, findPathToClosestFood, settings.pathThrottle, path.length]);

  useEffect(() => {
    if (!path.length || !snake.length) return;
    const head = snake[0];
    const next = path.find((step) => step.x !== head.x || step.y !== head.y);
    if (!next) return;

    const deltaX = next.x - head.x;
    const deltaY = next.y - head.y;

    if (Math.abs(deltaX) === 1 && deltaY === 0) {
      setDirection(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else if (Math.abs(deltaY) === 1 && deltaX === 0) {
      setDirection(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
    }
  }, [path, snake]);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => {
    if (!grid.columns || !grid.rows || isPaused) return;

    const interval = setInterval(() => {
      const currentDirection = directionRef.current;
      setSnake((currentSnake) => {
        if (!currentSnake.length) return currentSnake;

        const head = {
          x: currentSnake[0].x + currentDirection.x,
          y: currentSnake[0].y + currentDirection.y,
        };

        const outOfBounds =
          head.x < 0 || head.x >= grid.columns || head.y < 0 || head.y >= grid.rows;
        const hitSelf = currentSnake.some((segment) => segment.x === head.x && segment.y === head.y);

        if (outOfBounds || hitSelf) {
          const start = {
            x: Math.floor(grid.columns / 2),
            y: Math.floor(grid.rows / 2),
          };
          setDirection({ x: 1, y: 0 });
          setFood(generateFood(grid.columns, grid.rows, [start], settings.foodCount));
          return [start];
        }

        const nextSnake = [head, ...currentSnake];
        const currentFood = foodRef.current;
        const eatenIndex = currentFood.findIndex(
          (item) => item.x === head.x && item.y === head.y
        );

        if (eatenIndex === -1) {
          nextSnake.pop();
        } else {
          setFood((currentFoodState) => {
            const occupied = new Set(nextSnake.map(getKey));
            currentFoodState.forEach((item, index) => {
              if (index !== eatenIndex) {
                occupied.add(getKey(item));
              }
            });
            let attempts = 0;
            let replacement: Position | null = null;
            while (!replacement && attempts < 200) {
              const candidate = {
                x: Math.floor(Math.random() * grid.columns),
                y: Math.floor(Math.random() * grid.rows),
              };
              if (!occupied.has(getKey(candidate))) {
                replacement = candidate;
              }
              attempts += 1;
            }
            const updatedFood = [...currentFoodState];
            updatedFood[eatenIndex] = replacement ?? currentFoodState[eatenIndex];
            return updatedFood;
          });
        }

        if (nextSnake.length > settings.maxLength) {
          nextSnake.pop();
        }

        return nextSnake;
      });
    }, settings.tickMs);

    return () => clearInterval(interval);
  }, [grid.columns, grid.rows, generateFood, isPaused, settings.foodCount, settings.maxLength, settings.tickMs]);

  const drawFrame = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    if (!grid.width || !grid.height) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = grid.width * dpr;
    canvas.height = grid.height * dpr;
    canvas.style.width = `${grid.width}px`;
    canvas.style.height = `${grid.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, grid.width, grid.height);

    const styles = getComputedStyle(containerRef.current);
    const gridColor = styles.getPropertyValue("--snake-grid").trim() || "rgba(15,23,42,0.05)";
    const pathColor = styles.getPropertyValue("--snake-path").trim() || "rgba(37,99,235,0.12)";
    const bodyColor = styles.getPropertyValue("--snake-body").trim() || "rgba(37,99,235,0.25)";
    const foodColor = styles.getPropertyValue("--snake-food").trim() || "rgba(248,113,113,0.45)";

    const cellSize = settings.gridSize;

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x <= grid.width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, grid.height);
      ctx.stroke();
    }
    for (let y = 0; y <= grid.height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(grid.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = pathColor;
    const visiblePath = path.slice(0, settings.pathRenderLimit);
    visiblePath.forEach((pathPos, index) => {
      ctx.globalAlpha = Math.max(0.15, 1 - index * 0.05);
      ctx.fillRect(pathPos.x * cellSize, pathPos.y * cellSize, cellSize, cellSize);
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = bodyColor;
    snake.forEach((segment) => {
      const x = segment.x * cellSize + 1;
      const y = segment.y * cellSize + 1;
      const size = cellSize - 2;
      if ("roundRect" in ctx) {
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 6);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, size, size);
      }
    });

    ctx.fillStyle = foodColor;
    food.forEach((item) => {
      const centerX = item.x * cellSize + cellSize / 2;
      const centerY = item.y * cellSize + cellSize / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, cellSize / 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [food, grid.height, grid.width, path, settings.gridSize, settings.pathRenderLimit, snake]);

  useEffect(() => {
    drawFrame();
  }, [drawFrame]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 [--snake-grid:rgba(15,23,42,0.05)] [--snake-path:rgba(37,99,235,0.12)] [--snake-body:rgba(37,99,235,0.25)] [--snake-food:rgba(248,113,113,0.45)] dark:[--snake-grid:rgba(148,163,184,0.12)] dark:[--snake-path:rgba(56,189,248,0.18)] dark:[--snake-body:rgba(56,189,248,0.35)] dark:[--snake-food:rgba(248,113,113,0.6)]"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default AutoSnakeBackground;
