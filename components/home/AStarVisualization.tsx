"use client";

import { useEffect, useRef, useState } from "react";

import {
  findAStarPath,
  getGridPositionKey,
  type AStarResult,
  type GridPosition,
} from "@/lib/astar";

type Settings = {
  gridSize: number;
  obstacleDensity: number;
  visitedStepMs: number;
  pathStepMs: number;
  cyclePauseMs: number;
};

type Scene = AStarResult & {
  start: GridPosition;
  goal: GridPosition;
  blocked: Set<string>;
};

type Colors = {
  grid: string;
  explored: string;
  wall: string;
  path: string;
  pathStrong: string;
  goal: string;
};

const BASE_SETTINGS: Settings = {
  gridSize: 28,
  obstacleDensity: 0.13,
  visitedStepMs: 18,
  pathStepMs: 24, // 1.3x visitedStepsMs er bra
  cyclePauseMs: 200,
};

const MOBILE_SETTINGS: Settings = {
  gridSize: 36,
  obstacleDensity: 0.1,
  visitedStepMs: 24,
  pathStepMs: 30,
  cyclePauseMs: 2200,
};

const REDUCED_SETTINGS: Settings = {
  gridSize: 44,
  obstacleDensity: 0.08,
  visitedStepMs: 0,
  pathStepMs: 0,
  cyclePauseMs: 0,
};

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const randomInteger = (minimum: number, maximum: number) =>
  Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

const getCornerPosition = (
  corner: number,
  columns: number,
  rows: number,
  rangeX: number,
  rangeY: number,
): GridPosition => ({
  x:
    corner === 0 || corner === 3
      ? randomInteger(0, rangeX)
      : randomInteger(columns - rangeX - 1, columns - 1),
  y:
    corner === 0 || corner === 1
      ? randomInteger(0, rangeY)
      : randomInteger(rows - rangeY - 1, rows - 1),
});

const createScene = (columns: number, rows: number, settings: Settings): Scene => {
  const rangeX = Math.max(1, Math.floor(columns * 0.14));
  const rangeY = Math.max(1, Math.floor(rows * 0.14));
  const startCorner = randomInteger(0, 3);
  const goalCorner = (startCorner + 2) % 4;
  const start = getCornerPosition(startCorner, columns, rows, rangeX, rangeY);
  const goal = getCornerPosition(goalCorner, columns, rows, rangeX, rangeY);

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const blocked = new Set<string>();
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const position = { x, y };
        if (
          getGridPositionKey(position) !== getGridPositionKey(start) &&
          getGridPositionKey(position) !== getGridPositionKey(goal) &&
          Math.random() < settings.obstacleDensity
        ) {
          blocked.add(getGridPositionKey(position));
        }
      }
    }

    const result = findAStarPath({ columns, rows, start, goal, blocked });
    if (result.path.length > 0) return { ...result, start, goal, blocked };
  }

  const result = findAStarPath({ columns, rows, start, goal });
  return { ...result, start, goal, blocked: new Set() };
};

const readColors = (container: HTMLDivElement): Colors => {
  const styles = getComputedStyle(container);
  const rootStyles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    styles.getPropertyValue(name).trim() || rootStyles.getPropertyValue(fallback).trim();

  return {
    grid: read("--astar-grid", "--ds-color-neutral-border-subtle"),
    explored: read("--astar-explored", "--ds-color-accent-base-default"),
    wall: read("--astar-wall", "--ds-color-neutral-border-default"),
    path: read("--astar-path", "--ds-color-accent-base-default"),
    pathStrong: read("--astar-path-strong", "--ds-color-accent-base-default"),
    goal: read("--astar-goal", "--ds-color-danger-base-default"),
  };
};

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

const AStarVisualization = () => {
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
          : next,
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

    let scene: Scene | null = null;
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let devicePixelRatio = 0;
    let colors = readColors(container);
    let animationFrame = 0;
    let cycleTimeout = 0;
    let cycleStartedAt = 0;
    let lastFrameIndex = -1;
    let pausedAt = 0;
    let visible = !document.hidden;
    let intersecting = true;

    const drawMarker = (position: GridPosition, color: string) => {
      context.fillStyle = color;
      context.beginPath();
      context.arc(
        position.x * settings.gridSize + settings.gridSize / 2,
        position.y * settings.gridSize + settings.gridSize / 2,
        settings.gridSize / 3.4,
        0,
        Math.PI * 2,
      );
      context.fill();
    };

    const draw = (elapsed: number) => {
      if (!scene || width === 0 || height === 0) return;
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
      const visitedCount = environment.reducedMotion
        ? scene.visited.length
        : Math.min(scene.visited.length, Math.floor(elapsed / settings.visitedStepMs));

      context.fillStyle = colors.explored;
      scene.visited.slice(0, visitedCount).forEach((position, index) => {
        const distanceFromWave = visitedCount - index;
        context.globalAlpha = Math.max(0.22, 0.72 - distanceFromWave * 0.018);
        fillRoundedCell(context, position, settings.gridSize, 3);
      });
      context.globalAlpha = 1;

      const pathCount = environment.reducedMotion
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

      drawMarker(scene.start, colors.pathStrong);
      drawMarker(scene.goal, colors.goal);
    };

    const renderFrame = (timestamp: number) => {
      animationFrame = 0;
      if (!scene || environment.reducedMotion || !visible || !intersecting) return;
      if (cycleStartedAt === 0) cycleStartedAt = timestamp;

      const elapsed = timestamp - cycleStartedAt;
      const activeDuration =
        scene.visited.length * settings.visitedStepMs + scene.path.length * settings.pathStepMs;
      if (elapsed >= activeDuration) {
        if (lastFrameIndex !== scene.visited.length + scene.path.length) {
          draw(activeDuration);
          lastFrameIndex = scene.visited.length + scene.path.length;
        }
        cycleTimeout = window.setTimeout(() => {
          cycleTimeout = 0;
          if (!visible || !intersecting) return;
          scene = createScene(columns, rows, settings);
          cycleStartedAt = performance.now();
          lastFrameIndex = -1;
          draw(0);
          animationFrame = requestAnimationFrame(renderFrame);
        }, Math.max(0, activeDuration + settings.cyclePauseMs - elapsed));
        return;
      }

      const searchDuration = scene.visited.length * settings.visitedStepMs;
      const frameIndex =
        elapsed < searchDuration
          ? Math.floor(elapsed / settings.visitedStepMs)
          : scene.visited.length + Math.floor((elapsed - searchDuration) / settings.pathStepMs);
      if (frameIndex !== lastFrameIndex) {
        draw(elapsed);
        lastFrameIndex = frameIndex;
      }
      animationFrame = requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (
        environment.reducedMotion ||
        !visible ||
        !intersecting ||
        animationFrame !== 0 ||
        cycleTimeout !== 0
      ) {
        return;
      }
      if (pausedAt !== 0 && cycleStartedAt !== 0) {
        cycleStartedAt += performance.now() - pausedAt;
      }
      pausedAt = 0;
      animationFrame = requestAnimationFrame(renderFrame);
    };

    const stop = () => {
      if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
      if (cycleTimeout !== 0) window.clearTimeout(cycleTimeout);
      animationFrame = 0;
      cycleTimeout = 0;
      if (pausedAt === 0) pausedAt = performance.now();
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
      canvas.style.width = `${nextWidth}px`;
      canvas.style.height = `${nextHeight}px`;
      if (devicePixelRatio !== nextDpr || width !== nextWidth || height !== nextHeight) {
        context.setTransform(nextDpr, 0, 0, nextDpr, 0, 0);
      }

      const nextColumns = Math.max(6, Math.floor(nextWidth / settings.gridSize));
      const nextRows = Math.max(6, Math.floor(nextHeight / settings.gridSize));
      let sceneChanged = false;
      if (!scene || columns !== nextColumns || rows !== nextRows) {
        columns = nextColumns;
        rows = nextRows;
        scene = createScene(columns, rows, settings);
        cycleStartedAt = 0;
        lastFrameIndex = -1;
        sceneChanged = true;
      }

      width = nextWidth;
      height = nextHeight;
      devicePixelRatio = nextDpr;
      const elapsed =
        sceneChanged || cycleStartedAt === 0 ? 0 : performance.now() - cycleStartedAt;
      draw(environment.reducedMotion ? Number.POSITIVE_INFINITY : elapsed);
      start();
    };

    const handleVisibility = () => {
      visible = !document.hidden;
      if (visible) start();
      else stop();
    };
    const refreshColors = () => {
      colors = readColors(container);
      const elapsed = cycleStartedAt === 0 ? 0 : performance.now() - cycleStartedAt;
      draw(environment.reducedMotion ? Number.POSITIVE_INFINITY : elapsed);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      if (intersecting) start();
      else stop();
    });
    const themeObserver = new MutationObserver(refreshColors);
    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-color-scheme", "style"],
    });
    document.addEventListener("visibilitychange", handleVisibility);
    resize();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [environment.reducedMotion, settings]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-14 bottom-0 z-0 [--astar-grid:color-mix(in_srgb,var(--ds-color-neutral-border-subtle)_15%,transparent)] [--astar-explored:color-mix(in_srgb,var(--ds-color-accent-base-default)_13%,transparent)] [--astar-wall:color-mix(in_srgb,var(--ds-color-neutral-border-default)_16%,transparent)] [--astar-path:color-mix(in_srgb,var(--ds-color-accent-base-default)_18%,transparent)] [--astar-path-strong:color-mix(in_srgb,var(--ds-color-accent-base-default)_32%,transparent)] [--astar-goal:color-mix(in_srgb,var(--ds-color-danger-base-default)_45%,transparent)]"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};

export default AStarVisualization;
