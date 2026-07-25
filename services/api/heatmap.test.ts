import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchRunningHeatmap } from "./heatmap";

const validBody = {
  cell_size_m: 15,
  bounds: [10.62, 59.88, 10.86, 59.99],
  activity_count: 512,
  total_distance_m: 4_210_000,
  cells: [
    [10.7312, 59.9421, 12],
    [10.7314, 59.9423, 9],
  ],
};

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

describe("fetchRunningHeatmap", () => {
  it("expands the compact cell tuples into named fields", async () => {
    mockFetch(validBody);

    const heatmap = await fetchRunningHeatmap();

    expect(heatmap.cells).toEqual([
      { lon: 10.7312, lat: 59.9421, count: 12 },
      { lon: 10.7314, lat: 59.9423, count: 9 },
    ]);
    expect(heatmap.cellSizeM).toBe(15);
    expect(heatmap.bounds).toEqual([10.62, 59.88, 10.86, 59.99]);
    expect(heatmap.activityCount).toBe(512);
    expect(heatmap.totalDistanceM).toBe(4_210_000);
  });

  it("requests only runs", async () => {
    const fetchMock = mockFetch({ ...validBody, cells: [] });
    await fetchRunningHeatmap();

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.pathname).toBe("/strava/heatmap");
    expect(url.searchParams.get("activity_type")).toBe("Run");
  });

  it("tolerates the informational max_count without depending on it", async () => {
    mockFetch({ ...validBody, max_count: 87 });
    // Vekten skaleres mot cellene selv, så feltet skal verken kreves eller brukes.
    await expect(fetchRunningHeatmap()).resolves.toMatchObject({ activityCount: 512 });
  });

  it("accepts an empty heatmap reporting zero hits", async () => {
    mockFetch({
      ...validBody,
      cells: [],
      max_count: 0,
      activity_count: 0,
      total_distance_m: 0,
    });
    await expect(fetchRunningHeatmap()).resolves.toMatchObject({ cells: [] });
  });

  it("rejects coordinates outside the valid range", async () => {
    mockFetch({ ...validBody, cells: [[181, 59.94, 3]] });
    await expect(fetchRunningHeatmap()).rejects.toThrow();
  });

  it("rejects a cell with a non-positive count", async () => {
    mockFetch({ ...validBody, cells: [[10.73, 59.94, 0]] });
    await expect(fetchRunningHeatmap()).rejects.toThrow();
  });

  it("rejects a malformed cell tuple", async () => {
    mockFetch({ ...validBody, cells: [[10.73, 59.94]] });
    await expect(fetchRunningHeatmap()).rejects.toThrow();
  });

  it("throws when the response is not ok", async () => {
    mockFetch({}, false, 503);
    await expect(fetchRunningHeatmap()).rejects.toThrow("503");
  });
});
