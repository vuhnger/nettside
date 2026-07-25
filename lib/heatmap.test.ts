import { describe, expect, it } from "vitest";

import { maxCellCount, normalizeWeight, projectCells, toHeatmapGeoJson } from "./heatmap";
import type { HeatmapBounds, HeatmapCell } from "@/services/api/heatmap";

const cell = (lon: number, lat: number, count: number): HeatmapCell => ({ lon, lat, count });

describe("normalizeWeight", () => {
  it("gives the most-run cell full weight", () => {
    expect(normalizeWeight(100, 100)).toBe(1);
  });

  it("keeps rarely-run cells visible instead of crushing them toward zero", () => {
    // 27 av 108 turer er den travleste cellen målt i ekte data.
    const weight = normalizeWeight(1, 27);
    // Lineær normalisering ville gitt 0.04 — praktisk talt usynlig på kartet.
    expect(weight).toBeGreaterThan(0.15);
    expect(weight).toBeLessThan(1);
  });

  it("still ranks a repeated cell above a single-visit cell", () => {
    expect(normalizeWeight(20, 27)).toBeGreaterThan(normalizeWeight(2, 27));
  });

  it("handles a dataset where every cell has one hit", () => {
    expect(normalizeWeight(1, 1)).toBe(1);
  });

  it("returns zero when there is nothing to scale against", () => {
    expect(normalizeWeight(0, 0)).toBe(0);
  });
});

describe("maxCellCount", () => {
  it("returns zero for an empty dataset", () => {
    expect(maxCellCount([])).toBe(0);
  });

  it("finds the highest count", () => {
    expect(maxCellCount([cell(10, 59, 3), cell(10, 60, 41), cell(11, 59, 7)])).toBe(41);
  });
});

describe("toHeatmapGeoJson", () => {
  it("emits GeoJSON points in longitude, latitude order", () => {
    const collection = toHeatmapGeoJson([cell(10.7312, 59.9421, 12)]);

    expect(collection.type).toBe("FeatureCollection");
    expect(collection.features).toHaveLength(1);
    expect(collection.features[0].geometry.coordinates).toEqual([10.7312, 59.9421]);
  });

  it("normalizes weights against the busiest cell in the set", () => {
    const collection = toHeatmapGeoJson([cell(10, 59, 1), cell(11, 60, 50)]);
    const weights = collection.features.map((feature) => feature.properties.weight);

    expect(Math.max(...weights)).toBe(1);
    expect(weights.every((weight) => weight > 0 && weight <= 1)).toBe(true);
  });

  it("survives an empty dataset", () => {
    expect(toHeatmapGeoJson([]).features).toEqual([]);
  });
});

describe("projectCells", () => {
  // Kvadratisk utsnitt rundt ekvator gjør regnestykket lett å resonnere om.
  const bounds: HeatmapBounds = [0, 0, 10, 10];

  it("puts north at the top and west at the left", () => {
    const [northWest, southEast] = projectCells(
      [cell(0, 10, 1), cell(10, 0, 1)],
      bounds,
      100,
      100,
    );

    expect(northWest.y).toBeLessThan(southEast.y);
    expect(northWest.x).toBeLessThan(southEast.x);
  });

  it("keeps every point inside the view box", () => {
    const projected = projectCells(
      [cell(0, 10, 1), cell(10, 0, 1), cell(5, 5, 1)],
      bounds,
      100,
      100,
    );

    for (const point of projected) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(100);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(100);
    }
  });

  it("centers the content rather than stretching it to fill", () => {
    // Et bredt, lavt utsnitt i en kvadratisk viewBox må få luft over og under.
    const wide: HeatmapBounds = [0, 0, 20, 5];
    const projected = projectCells([cell(0, 5, 1), cell(20, 0, 1)], wide, 100, 100);
    const ys = projected.map((point) => point.y);
    const xs = projected.map((point) => point.x);

    expect(Math.min(...ys)).toBeGreaterThan(0);
    expect(Math.min(...ys) + Math.max(...ys)).toBeCloseTo(100, 6);
    // Den brede aksen fyller viewBoxen.
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(100, 6);
  });

  it("does not produce NaN for a single cell with no extent", () => {
    const point = projectCells([cell(10, 59, 4)], [10, 59, 10, 59], 100, 100)[0];

    expect(Number.isFinite(point.x)).toBe(true);
    expect(Number.isFinite(point.y)).toBe(true);
  });

  it("carries the normalized weight through", () => {
    const projected = projectCells([cell(0, 10, 1), cell(10, 0, 40)], bounds, 100, 100);
    expect(projected[1].weight).toBe(1);
    expect(projected[0].weight).toBeLessThan(1);
  });
});
