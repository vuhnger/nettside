import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchCodingStats,
  fetchRunningActivities,
  fetchRunningDistance,
} from "./stats";

const mockFetch = (body: unknown, ok = true, status = 200) => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  } as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchRunningDistance", () => {
  it("returns the year-to-date run distance", async () => {
    mockFetch({ data: { run: { distance: 1234.5 } } });
    await expect(fetchRunningDistance()).resolves.toBe(1234.5);
  });

  it("returns undefined when there is no run data", async () => {
    mockFetch({ data: {} });
    await expect(fetchRunningDistance()).resolves.toBeUndefined();
  });

  it("throws when the response is not ok", async () => {
    mockFetch({}, false, 502);
    await expect(fetchRunningDistance()).rejects.toThrow("502");
  });

  it("throws when the payload fails schema validation", async () => {
    mockFetch({ data: { run: { distance: "not-a-number" } } });
    await expect(fetchRunningDistance()).rejects.toThrow();
  });
});

describe("fetchRunningActivities", () => {
  it("maps distance and moving time into camelCase", async () => {
    mockFetch({
      data: [
        { distance: 5000, moving_time: 1500 },
        { distance: 8000 },
      ],
    });
    await expect(fetchRunningActivities(2026)).resolves.toEqual([
      { distance: 5000, movingTime: 1500 },
      { distance: 8000, movingTime: undefined },
    ]);
  });

  it("rejects negative distances", async () => {
    mockFetch({ data: [{ distance: -1 }] });
    await expect(fetchRunningActivities(2026)).rejects.toThrow();
  });

  it("requests the given year within the API's limit cap", async () => {
    const fetchMock = mockFetch({ data: [] });
    await fetchRunningActivities(2026);

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get("year")).toBe("2026");
    // API-et svarer 422 på limit over 200, så vi må holde oss innenfor.
    expect(Number(url.searchParams.get("limit"))).toBeLessThanOrEqual(200);
  });

  it("paginates with offset and merges every page", async () => {
    const fullPage = {
      total: 250,
      data: Array.from({ length: 200 }, () => ({ distance: 1000 })),
    };
    const lastPage = {
      total: 250,
      data: Array.from({ length: 50 }, () => ({ distance: 2000 })),
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => fullPage })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => lastPage });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchRunningActivities(2026);

    expect(result).toHaveLength(250);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain("offset=0");
    expect(String(fetchMock.mock.calls[1][0])).toContain("offset=200");
  });

  it("stops after a single page when the year has few activities", async () => {
    const fetchMock = mockFetch({ total: 2, data: [{ distance: 1 }, { distance: 2 }] });
    await fetchRunningActivities(2026);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("fetchCodingStats", () => {
  it("prefers the total seconds of the Coding category", async () => {
    mockFetch({
      data: {
        range: "last_7_days",
        total_seconds: 9999,
        categories: [
          { name: "Browsing", total_seconds: 100 },
          { name: "Coding", total_seconds: 4200 },
        ],
        languages: [
          { name: "TypeScript" },
          { name: "Python" },
          { name: "Go" },
          { name: "Rust" },
          { name: "Bash" },
        ],
      },
    });

    const stats = await fetchCodingStats();
    expect(stats.range).toBe("last_7_days");
    expect(stats.totalSeconds).toBe(4200);
    // Kun de fire første språkene beholdes.
    expect(stats.languages).toEqual(["TypeScript", "Python", "Go", "Rust"]);
  });

  it("falls back to the overall total when there is no Coding category", async () => {
    mockFetch({ data: { total_seconds: 720, categories: [], languages: [] } });
    const stats = await fetchCodingStats();
    expect(stats.totalSeconds).toBe(720);
    expect(stats.languages).toEqual([]);
  });

  it("handles a payload with no languages field", async () => {
    mockFetch({ data: { range: "last_7_days" } });
    const stats = await fetchCodingStats();
    expect(stats.languages).toEqual([]);
    expect(stats.totalSeconds).toBeUndefined();
  });
});
