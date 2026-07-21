import { describe, expect, it } from "vitest";

import { parseBackgroundVisualization } from "./background-visualization";

describe("parseBackgroundVisualization", () => {
  it("keeps supported values", () => {
    expect(parseBackgroundVisualization("mst")).toBe("mst");
    expect(parseBackgroundVisualization("astar")).toBe("astar");
  });

  it("falls back to A-star for missing or invalid values", () => {
    expect(parseBackgroundVisualization(null)).toBe("astar");
    expect(parseBackgroundVisualization("unknown")).toBe("astar");
  });
});
