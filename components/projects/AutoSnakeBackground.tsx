"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Position = {
  x: number;
  y: number;
};

const GRID_SIZE = 28;
const FOOD_COUNT = 6;
const SNAKE_TICK_MS = 80;

const getKey = (pos: Position) => `${pos.x},${pos.y}`;

const AutoSnakeBackground = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [grid, setGrid] = useState({ width: 0, height: 0, columns: 0, rows: 0 });
  const [snake, setSnake] = useState<Position[]>([]);
  const [food, setFood] = useState<Position[]>([]);
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [path, setPath] = useState<Position[]>([]);

  const generateFood = useCallback(
    (columns: number, rows: number, snakeBody: Position[]) => {
      const positions: Position[] = [];
      const occupied = new Set(snakeBody.map(getKey));
      let attempts = 0;

      while (positions.length < FOOD_COUNT && attempts < FOOD_COUNT * 20) {
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
      const columns = Math.max(10, Math.floor(rect.width / GRID_SIZE));
      const rows = Math.max(10, Math.floor(rect.height / GRID_SIZE));
      setGrid({ width: rect.width, height: rect.height, columns, rows });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!grid.columns || !grid.rows) return;
    const start = {
      x: Math.floor(grid.columns / 2),
      y: Math.floor(grid.rows / 2),
    };
    setSnake([start]);
    setDirection({ x: 1, y: 0 });
    setFood(generateFood(grid.columns, grid.rows, [start]));
  }, [grid.columns, grid.rows, generateFood]);

  useEffect(() => {
    if (!snake.length || !food.length) return;
    const newPath = findPathToClosestFood(snake[0], food, snake);
    setPath(newPath);
  }, [snake, food, findPathToClosestFood]);

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
    if (!grid.columns || !grid.rows) return;

    const interval = setInterval(() => {
      setSnake((currentSnake) => {
        if (!currentSnake.length) return currentSnake;

        const head = {
          x: currentSnake[0].x + direction.x,
          y: currentSnake[0].y + direction.y,
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
          setFood(generateFood(grid.columns, grid.rows, [start]));
          return [start];
        }

        const nextSnake = [head, ...currentSnake];
        const eatenIndex = food.findIndex((item) => item.x === head.x && item.y === head.y);

        if (eatenIndex === -1) {
          nextSnake.pop();
        } else {
          setFood((currentFood) => {
            const occupied = new Set(nextSnake.map(getKey));
            currentFood.forEach((item, index) => {
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
            const updatedFood = [...currentFood];
            updatedFood[eatenIndex] = replacement ?? currentFood[eatenIndex];
            return updatedFood;
          });
        }

        return nextSnake;
      });
    }, SNAKE_TICK_MS);

    return () => clearInterval(interval);
  }, [direction, food, generateFood, grid.columns, grid.rows]);

  if (!grid.columns || !grid.rows) {
    return <div ref={containerRef} className="fixed inset-0" aria-hidden="true" />;
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 [--snake-grid:rgba(15,23,42,0.05)] [--snake-path:rgba(37,99,235,0.12)] [--snake-body:rgba(37,99,235,0.25)] [--snake-food:rgba(248,113,113,0.45)] dark:[--snake-grid:rgba(148,163,184,0.12)] dark:[--snake-path:rgba(56,189,248,0.18)] dark:[--snake-body:rgba(56,189,248,0.35)] dark:[--snake-food:rgba(248,113,113,0.6)]"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${grid.width} ${grid.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="snake-grid"
            width={GRID_SIZE}
            height={GRID_SIZE}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
              fill="none"
              stroke="var(--snake-grid)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#snake-grid)" />

        {path.map((pathPos, index) => (
          <rect
            key={`path-${index}`}
            x={pathPos.x * GRID_SIZE}
            y={pathPos.y * GRID_SIZE}
            width={GRID_SIZE}
            height={GRID_SIZE}
            fill="var(--snake-path)"
            opacity={Math.max(0.15, 1 - index * 0.05)}
          />
        ))}

        {snake.map((segment, index) => (
          <rect
            key={`snake-${index}`}
            x={segment.x * GRID_SIZE}
            y={segment.y * GRID_SIZE}
            width={GRID_SIZE - 2}
            height={GRID_SIZE - 2}
            fill="var(--snake-body)"
            rx="6"
          />
        ))}

        {food.map((item, index) => (
          <circle
            key={`food-${index}`}
            cx={item.x * GRID_SIZE + GRID_SIZE / 2}
            cy={item.y * GRID_SIZE + GRID_SIZE / 2}
            r={GRID_SIZE / 3.2}
            fill="var(--snake-food)"
          />
        ))}
      </svg>
    </div>
  );
};

export default AutoSnakeBackground;
