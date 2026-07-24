"use client";

import { useEffect, useRef } from "react";

import {
  observeThemeChange,
  syncCanvasResolution,
} from "@/components/visualization/canvas";
import { useVisualizationEnvironment } from "@/components/visualization/useVisualizationEnvironment";

import { readColors } from "./snake/colors";
import {
  advanceGame,
  createGame,
  findPathToClosestFood,
  type SnakeGame,
} from "./snake/game";
import {
  BASE_SETTINGS,
  MOBILE_SETTINGS,
  REDUCED_SETTINGS,
} from "./snake/settings";

const AutoSnakeBackground = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const environment = useVisualizationEnvironment();

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

    let game: SnakeGame | null = null;
    let width = 0;
    let height = 0;
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
          Math.PI * 2,
        );
        context.fill();
      });
    };

    const resize = () => {
      const { width: nextWidth, height: nextHeight } = syncCanvasResolution(
        canvas,
        context,
        container,
      );

      const columns = Math.max(10, Math.floor(nextWidth / settings.gridSize));
      const rows = Math.max(10, Math.floor(nextHeight / settings.gridSize));
      if (!game || game.columns !== columns || game.rows !== rows) {
        game = createGame(columns, rows, settings);
        if (environment.reducedMotion) game = { ...game, path: findPathToClosestFood(game) };
      }

      width = nextWidth;
      height = nextHeight;
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
    const disconnectThemeObserver = observeThemeChange(refreshColors);
    resizeObserver.observe(container);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      disconnectThemeObserver();
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
