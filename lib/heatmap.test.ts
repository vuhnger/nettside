import { describe, expect, it } from "vitest";

import {
  maxCellCount,
  normalizeWeight,
  projectCells,
  rasterizeCells,
  toHeatmapGeoJson,
} from "./heatmap";
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

describe("rasterizeCells", () => {
  const bounds: HeatmapBounds = [0, 0, 10, 10];

  it("collapses cells that land in the same grid square", () => {
    // Tre celler så tett at de havner innenfor samme 20px-rute.
    const dense = [cell(0.01, 9.99, 1), cell(0.02, 9.98, 1), cell(0.03, 9.97, 1)];

    expect(rasterizeCells(dense, bounds, 100, 100, 20)).toHaveLength(1);
  });

  it("keeps cells in different grid squares apart", () => {
    const spread = [cell(0, 10, 1), cell(10, 0, 1)];

    expect(rasterizeCells(spread, bounds, 100, 100, 20)).toHaveLength(2);
  });

  it("sums the hits inside a square so busy areas stay hottest", () => {
    // Fire spredte enkeltturer mot én rute som er løpt tre ganger: summering
    // gjør at området med mest løping vinner, ikke cellen med høyest enkelttall.
    const cells = [
      cell(0.01, 9.99, 1),
      cell(0.02, 9.98, 1),
      cell(0.03, 9.97, 1),
      cell(0.04, 9.96, 1),
      cell(9.99, 0.01, 3),
    ];
    const [busy, single] = rasterizeCells(cells, bounds, 100, 100, 20);

    expect(busy.weight).toBe(1);
    expect(single.weight).toBeLessThan(1);
  });

  it("snaps each square to its own centre", () => {
    const [point] = rasterizeCells([cell(0.01, 9.99, 1)], bounds, 100, 100, 20);

    expect(point.x).toBe(10);
    expect(point.y).toBe(10);
  });

  it("keeps the cells at the far edge inside the drawing area", () => {
    // Utstrekningen kommer fra cellene, så hjørnecellene projiseres til presis
    // 100. De skal havne i siste rute, ikke i en egen rute utenfor flaten.
    const corners = [cell(0, 10, 1), cell(10, 0, 1), cell(10, 10, 1)];

    for (const point of rasterizeCells(corners, bounds, 100, 100, 20)) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(100);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(100);
    }
  });

  it("pulls a partial final square in from the edge", () => {
    // 100px deles ikke jevnt på 30, så siste rute dekker bare 90..100. Sentrum
    // skal ligge på 95, ikke på 105 som en full rute ville gitt.
    const [point] = rasterizeCells([cell(10, 0, 1)], bounds, 100, 100, 30);

    expect(point.x).toBe(95);
    expect(point.y).toBe(95);
  });

  it("falls back to per-cell projection when the grid is disabled", () => {
    const cells = [cell(0.01, 9.99, 1), cell(0.02, 9.98, 1)];

    expect(rasterizeCells(cells, bounds, 100, 100, 0)).toEqual(
      projectCells(cells, bounds, 100, 100),
    );
  });

  it("survives an empty dataset", () => {
    expect(rasterizeCells([], bounds, 100, 100, 20)).toEqual([]);
  });
});
