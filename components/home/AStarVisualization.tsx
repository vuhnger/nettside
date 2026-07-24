"use client";

import { useEffect, useRef } from "react";

import {
  observeThemeChange,
  syncCanvasResolution,
} from "@/components/visualization/canvas";
import { useVisualizationEnvironment } from "@/components/visualization/useVisualizationEnvironment";

import { readColors } from "./astar/colors";
import { drawScene } from "./astar/render";
import { createScene, type Scene } from "./astar/scene";
import {
  BASE_SETTINGS,
  MOBILE_SETTINGS,
  REDUCED_SETTINGS,
} from "./astar/settings";

const AStarVisualization = () => {
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

    let scene: Scene | null = null;
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let colors = readColors(container);
    let animationFrame = 0;
    let cycleTimeout = 0;
    let cycleStartedAt = 0;
    let lastFrameIndex = -1;
    let pausedAt = 0;
    let visible = !document.hidden;
    let intersecting = true;

    const draw = (elapsed: number) => {
      if (!scene || width === 0 || height === 0) return;
      drawScene(context, {
        scene,
        width,
        height,
        settings,
        colors,
        reducedMotion: environment.reducedMotion,
        elapsed,
      });
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
      const { width: nextWidth, height: nextHeight } = syncCanvasResolution(
        canvas,
        context,
        container,
      );

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
    const disconnectThemeObserver = observeThemeChange(refreshColors);
    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", handleVisibility);
    resize();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      disconnectThemeObserver();
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
