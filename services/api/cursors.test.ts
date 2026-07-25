import { describe, expect, it } from "vitest";

import {
  CURSOR_PING_MESSAGE,
  cursorSocketUrl,
  cursorUpdateMessage,
  parseCursorMessage,
} from "./cursors";

const welcome = {
  t: "welcome",
  id: "abc",
  color: "#e11d48",
  peers: [{ id: "def", color: "#0ea5e9", x: 0.5, y: 0.25 }],
  tick_hz: 15,
  idle_timeout_seconds: 900,
};

describe("parseCursorMessage", () => {
  it("leser en welcome med full romtilstand", () => {
    const message = parseCursorMessage(JSON.stringify(welcome));

    expect(message).toEqual(expect.objectContaining({ t: "welcome", id: "abc" }));
    expect(message?.t === "welcome" && message.peers).toHaveLength(1);
  });

  it("godtar en peer uten posisjon", () => {
    // Noen som nettopp koblet til har ikke rukket å bevege pekeren. Å avvise
    // hele welcome-en for det ville tømt rommet for alle andre også.
    const message = parseCursorMessage(
      JSON.stringify({ ...welcome, peers: [{ id: "def", color: "#0ea5e9" }] }),
    );

    expect(message?.t).toBe("welcome");
  });

  it("leser en frame", () => {
    const message = parseCursorMessage(JSON.stringify({ t: "frame", c: { def: [0.1, 0.9] } }));

    expect(message).toEqual({ t: "frame", c: { def: [0.1, 0.9] } });
  });

  it("dropper et ugyldig frame-innslag uten å forkaste resten", () => {
    // Én tilkobling som sender noe rart skal koste den tilkoblingen, ikke fryse
    // samtlige cursors i rommet: zod feiler ellers hele recorden på ett innslag.
    const message = parseCursorMessage(
      JSON.stringify({
        t: "frame",
        c: { def: [0.1, 0.9], bad: [0.1], worse: "nope", ["x".repeat(100)]: [0.2, 0.2] },
      }),
    );

    expect(message).toEqual({ t: "frame", c: { def: [0.1, 0.9] } });
  });

  it("slår ikke opp i Object.prototype for ukjente frame-nøkler", () => {
    const message = parseCursorMessage(JSON.stringify({ t: "frame", c: {} }));

    expect(message?.t === "frame" && message.c["constructor"]).toBeUndefined();
  });

  it("dropper en ugyldig peer i welcome uten å forkaste resten", () => {
    const message = parseCursorMessage(
      JSON.stringify({
        ...welcome,
        peers: [{ id: "def", color: "#0ea5e9" }, { id: "ghi", color: "ikke-en-farge" }],
      }),
    );

    expect(message?.t === "welcome" && message.peers).toEqual([{ id: "def", color: "#0ea5e9" }]);
  });

  it("avviser en farge som ikke er en hex-farge", () => {
    // `color` går rett inn i en SVG-fill. En streng som ikke har formen vi har
    // bestemt, skal aldri komme så langt.
    expect(
      parseCursorMessage(JSON.stringify({ t: "join", id: "def", color: "url(#x)" })),
    ).toBeNull();
    expect(
      parseCursorMessage(JSON.stringify({ t: "join", id: "def", color: "red" })),
    ).toBeNull();
  });

  it("avviser en id uten grenser", () => {
    expect(
      parseCursorMessage(JSON.stringify({ t: "leave", id: "x".repeat(500) })),
    ).toBeNull();
  });

  it.each([
    ["ukjent meldingstype", JSON.stringify({ t: "banana" })],
    ["ødelagt JSON", "{ ikke json"],
    ["welcome uten id", JSON.stringify({ t: "welcome", color: "#ffffff", peers: [] })],
    ["ren tekst", "hei"],
  ])("gir null for %s", (_label, payload) => {
    expect(parseCursorMessage(payload)).toBeNull();
  });

  it.each([null, undefined, 42, { t: "pong" }, new ArrayBuffer(8)])(
    "gir null for ikke-tekst %p",
    (payload) => {
      // `MessageEvent.data` er `any`. Binære rammer er ikke en del av protokollen.
      expect(parseCursorMessage(payload)).toBeNull();
    },
  );

  it("nekter å parse en urimelig stor melding", () => {
    // Beskytter mot å bruke fanen på `JSON.parse` av noe vi aldri ba om.
    const huge = JSON.stringify({ t: "error", code: "x".repeat(200_000) });
    expect(parseCursorMessage(huge)).toBeNull();
  });

  it("kaster aldri", () => {
    for (const payload of ["", "[]", "null", "0", '{"t":null}', "{}"]) {
      expect(() => parseCursorMessage(payload)).not.toThrow();
    }
  });
});

describe("cursorSocketUrl", () => {
  // Verten kommer fra `NEXT_PUBLIC_API_BASE_URL` og varierer med miljøet, så
  // testen sjekker formen framfor en bestemt adresse — en literal ville brutt
  // `pnpm run check` for alle som peker mot en lokal backend.
  it("bruker ws-protokoll og legger rommet i query", () => {
    const url = cursorSocketUrl("/projects");

    expect(url).not.toBeNull();
    const parsed = new URL(url as string);
    expect(["ws:", "wss:"]).toContain(parsed.protocol);
    expect(parsed.pathname).toBe("/site/ws/cursors");
    expect(parsed.searchParams.get("room")).toBe("/projects");
  });
});

describe("klientmeldinger", () => {
  it("sender posisjon som andel", () => {
    expect(cursorUpdateMessage(0.51, 0.28)).toBe('{"t":"cursor","x":0.51,"y":0.28}');
  });

  it("har en ferdig serialisert ping", () => {
    // Sendes hvert 30. sekund; det er ingen grunn til å bygge strengen på nytt.
    expect(CURSOR_PING_MESSAGE).toBe('{"t":"ping"}');
  });
});
