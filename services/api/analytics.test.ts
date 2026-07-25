import { afterEach, describe, expect, it, vi } from "vitest";

import { recordVisit } from "./analytics";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("recordVisit", () => {
  it("posts path and referrer to the visit endpoint with keepalive", () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    vi.stubGlobal("fetch", fetchMock);

    recordVisit("/prosjekter", "https://example.com");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("/site/visit");
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
    expect(init.headers).toMatchObject({ "content-type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({
      path: "/prosjekter",
      referrer: "https://example.com",
    });
  });

  it("never throws when fetch rejects asynchronously", () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    expect(() => recordVisit("/", "")).not.toThrow();
  });

  it("never throws when fetch throws synchronously", () => {
    vi.stubGlobal("fetch", () => {
      throw new TypeError("Failed to fetch");
    });
    expect(() => recordVisit("/", "")).not.toThrow();
  });
});
