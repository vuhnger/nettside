import { describe, expect, it } from "vitest";

import {
  CLOSE_POLICY_VIOLATION,
  CURSOR_ROOM_MAX_LENGTH,
  DEFAULT_CURSOR_ROOM,
  PING_INTERVAL_MAX_MS,
  RECONNECT_MAX_MS,
  clampFraction,
  pingInterval,
  reconnectDelay,
  sanitizeRoom,
  shouldReconnect,
  viewportFraction,
} from "./cursors";

/** Tegnsettet serveren aksepterer. Testene under måles mot denne. */
const LEGAL_ROOM = /^[A-Za-z0-9/_.-]+$/;

describe("sanitizeRoom", () => {
  it("lar en vanlig rute stå urørt", () => {
    expect(sanitizeRoom("/projects/architecture")).toBe("/projects/architecture");
  });

  it.each([undefined, null, "", "?#", "æøå"])(
    "faller tilbake til roten for %p",
    (input) => {
      // Alternativet er å hoppe over tilkoblingen helt. Roten er et lovlig rom,
      // så heller litt for bred tilstedeværelse enn ingen.
      expect(sanitizeRoom(input)).toBe(DEFAULT_CURSOR_ROOM);
    },
  );

  it("fjerner tegn serveren ville avvist handshaket på", () => {
    const room = sanitizeRoom("/søk?q=a b&x=1#topp");
    expect(room).toMatch(LEGAL_ROOM);
  });

  it("korter ned til lengdegrensen", () => {
    const room = sanitizeRoom(`/${"a".repeat(200)}`);
    expect(room).toHaveLength(CURSOR_ROOM_MAX_LENGTH);
  });
});

describe("clampFraction", () => {
  it.each([
    [0.42, 0.42],
    [-3, 0],
    [7, 1],
  ])("klemmer %p til %p", (input, expected) => {
    expect(clampFraction(input)).toBe(expected);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "gir en tegnbar verdi for %p",
    (input) => {
      // Verdien havner rett i en CSS-transform. `NaN` der gjør ikke bare denne
      // cursoren usynlig, den gjør stilen ugyldig.
      expect(Number.isFinite(clampFraction(input))).toBe(true);
    },
  );
});

describe("viewportFraction", () => {
  it("regner om piksler til andel", () => {
    expect(viewportFraction(320, 1280)).toBe(0.25);
  });

  it("klemmer en posisjon utenfor viewporten", () => {
    expect(viewportFraction(-40, 800)).toBe(0);
  });

  it.each([0, -1, Number.NaN])("gir null for viewportstørrelse %p", (size) => {
    // Uten dette blir andelen `Infinity` eller `NaN` og går ut på socketen.
    expect(viewportFraction(100, size)).toBeNull();
  });
});

describe("pingInterval", () => {
  it("pinger flere ganger per idle-timeout", () => {
    // Én tapt ping skal ikke koste tilstedeværelsen, så intervallet må være en
    // god del kortere enn timeouten det holder unna.
    expect(pingInterval(60)).toBe(20_000);
  });

  it("pinger aldri sjeldnere enn taket, uansett hvor romslig serveren er", () => {
    expect(pingInterval(900)).toBe(PING_INTERVAL_MAX_MS);
  });

  it("faller tilbake til taket uten en oppgitt timeout", () => {
    expect(pingInterval(undefined)).toBe(PING_INTERVAL_MAX_MS);
  });

  it("lar ikke en absurd timeout gjøre klienten om til en spammer", () => {
    // Meldingsgrensen inn er 60/s; en timeout på under et sekund skal ikke
    // presse pingene opp mot den.
    expect(pingInterval(0.1)).toBeGreaterThanOrEqual(1000);
  });
});

describe("shouldReconnect", () => {
  it("prøver ikke på nytt etter en policy-avvisning", () => {
    // Origin, romnavn og antall faner fra IP-en er de samme neste gang.
    expect(shouldReconnect(CLOSE_POLICY_VIOLATION)).toBe(false);
  });

  it.each([
    [1000, "normal close, inkludert idle-timeout"],
    [1006, "socketen døde uten close-frame"],
    [1012, "serveren starter på nytt"],
    [1013, "fullt, men kom gjerne tilbake"],
  ])("prøver på nytt etter %i (%s)", (code) => {
    expect(shouldReconnect(code)).toBe(true);
  });
});

describe("reconnectDelay", () => {
  it("øker eksponentielt", () => {
    const jitter = 0.5;
    expect(reconnectDelay(1, jitter)).toBeGreaterThan(reconnectDelay(0, jitter));
    expect(reconnectDelay(3, jitter)).toBeGreaterThan(reconnectDelay(2, jitter));
  });

  it("holder seg under taket uansett antall forsøk", () => {
    // Jitteren skalerer forsinkelsen ned, ikke opp. Ble den lagt oppå, ville et
    // tak på 30s i praksis vært 45s.
    for (const attempt of [0, 1, 5, 6, 50, 5000]) {
      expect(reconnectDelay(attempt, 0.999)).toBeLessThanOrEqual(RECONNECT_MAX_MS);
    }
  });

  it("sprer forsøkene ut i tid", () => {
    // Poenget med jitter: alle åpne faner kobler opp igjen samtidig etter en
    // deploy, og lik forsinkelse gjør dem til én bølge.
    expect(reconnectDelay(4, 0)).not.toBe(reconnectDelay(4, 0.9));
  });

  it("er alltid positiv", () => {
    expect(reconnectDelay(0, 0)).toBeGreaterThan(0);
  });
});
