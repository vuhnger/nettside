import { afterEach, describe, expect, it, vi } from "vitest";

import { recordVisit } from "./analytics";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("recordVisit", () => {
  it("uses sendBeacon when available", () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { sendBeacon });

    recordVisit("/prosjekter", "https://example.com");

    expect(sendBeacon).toHaveBeenCalledOnce();
    expect(String(sendBeacon.mock.calls[0][0])).toContain("/site/visit");
  });

  it("falls back to fetch when sendBeacon is unavailable", () => {
    vi.stubGlobal("navigator", {});
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    vi.stubGlobal("fetch", fetchMock);

    recordVisit("/cv", "");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
  });

  it("never throws even if sendBeacon throws synchronously", () => {
    vi.stubGlobal("navigator", {
      sendBeacon: () => {
        throw new TypeError("Failed to fetch");
      },
    });

    expect(() => recordVisit("/", "")).not.toThrow();
  });

  it("never throws even if fetch throws synchronously", () => {
    vi.stubGlobal("navigator", {});
    vi.stubGlobal("fetch", () => {
      throw new TypeError("Failed to fetch");
    });

    expect(() => recordVisit("/", "")).not.toThrow();
  });
});
