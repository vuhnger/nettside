import { describe, expect, it } from "vitest";

import { calculateMasterProgress } from "./master";

describe("calculateMasterProgress", () => {
  const start = Date.parse("2025-01-01T00:00:00Z");
  const end = Date.parse("2025-01-11T00:00:00Z");

  it("clamps progress to zero before the period starts", () => {
    expect(calculateMasterProgress(start, end, start - 1)).toBe(0);
  });

  it("calculates rounded progress during the period", () => {
    expect(calculateMasterProgress(start, end, start + (end - start) / 3)).toBe(33);
  });

  it("clamps progress to 100 after the period ends", () => {
    expect(calculateMasterProgress(start, end, end + 1)).toBe(100);
  });

  it("treats an equal or reversed period as complete", () => {
    expect(calculateMasterProgress(start, start, start)).toBe(100);
    expect(calculateMasterProgress(end, start, start)).toBe(100);
  });

  it("handles invalid timestamps without returning NaN", () => {
    expect(calculateMasterProgress(Number.NaN, end, start)).toBe(100);
    expect(calculateMasterProgress(start, Number.NaN, start)).toBe(100);
    expect(calculateMasterProgress(start, end, Number.NaN)).toBe(100);
  });
});
