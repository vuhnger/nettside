import { afterEach, describe, expect, it, vi } from "vitest";

import { isSnowingInOsloToday, snowsOnDay } from "./weather";

const forecast = (entries: [string, string | undefined][]) => ({
  properties: {
    timeseries: entries.map(([time, symbol]) => ({
      time,
      data: symbol ? { next_1_hours: { summary: { symbol_code: symbol } } } : {},
    })),
  },
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("snowsOnDay", () => {
  const now = new Date("2026-11-12T20:00:00Z");

  it("is true when any hour today has a snow symbol", () => {
    expect(
      snowsOnDay(forecast([["2026-11-12T20:00:00Z", "cloudy"], ["2026-11-12T21:00:00Z", "lightsnowshowers_night"]]), now),
    ).toBe(true);
  });

  it("ignores sleet and hours without a one-hour summary", () => {
    expect(
      snowsOnDay(forecast([["2026-11-12T21:00:00Z", "lightsleet"], ["2026-11-12T22:00:00Z", undefined]]), now),
    ).toBe(false);
  });

  it("uses the Oslo calendar day, not UTC", () => {
    expect(snowsOnDay(forecast([["2026-11-12T23:00:00Z", "snow"]]), now)).toBe(false);
    expect(snowsOnDay(forecast([["2026-11-11T23:00:00Z", "snow"]]), now)).toBe(true);
  });
});

describe("isSnowingInOsloToday", () => {
  it("is false when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(isSnowingInOsloToday()).resolves.toBe(false);
  });

  it("is false when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 } as Response));
    await expect(isSnowingInOsloToday()).resolves.toBe(false);
  });

  it("is false when the payload is malformed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) } as Response));
    await expect(isSnowingInOsloToday()).resolves.toBe(false);
  });
});
