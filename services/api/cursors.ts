import { z } from "zod";

import { API_BASE_URL } from "./client";

/**
 * Protokollgrensen mot `WS /site/ws/cursors`.
 *
 * Meldingene fra serveren er ekstern JSON på lik linje med et HTTP-svar, så de
 * parses med Zod før de får lov til å bety noe. Det er ikke bare formalisme her:
 * `color` går rett inn i en CSS-verdi og `id` blir en oppslagsnøkkel, så begge
 * må ha en form vi har bestemt selv.
 */

/** Serveren tildeler farger som `#rrggbb`. Alt annet er ikke en farge vi tegner. */
const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

/**
 * IDene er ugjennomsiktige for oss; det eneste som betyr noe er at de er korte
 * strenger. Grensen hindrer at en id på en megabyte havner i en React-nøkkel.
 */
const peerIdSchema = z.string().min(1).max(64);

const coordinateSchema = z.number();

/**
 * `welcome.peers` beskriver hele romtilstanden. `x`/`y` er valgfrie fordi noen
 * som nettopp koblet til ikke nødvendigvis har rukket å bevege pekeren; da har
 * de ingen posisjon å tegnes på ennå.
 */
const peerSchema = z.object({
  id: peerIdSchema,
  color: colorSchema,
  x: coordinateSchema.optional(),
  y: coordinateSchema.optional(),
});

/**
 * Én ugyldig peer skal koste den peeren, ikke hele meldingen. Zod feiler ellers
 * hele recorden/arrayen på ett dårlig innslag, og både `welcome` og `frame`
 * beskriver alle i rommet — å forkaste dem kollektivt ville fryst samtlige
 * cursors fordi én tilkobling sendte noe rart.
 */
const tolerantPeersSchema = z.array(z.unknown()).transform((list) =>
  list.flatMap((entry) => {
    const parsed = peerSchema.safeParse(entry);
    return parsed.success ? [parsed.data] : [];
  }),
);

const welcomeSchema = z.object({
  t: z.literal("welcome"),
  id: peerIdSchema,
  color: colorSchema,
  peers: tolerantPeersSchema,
  tick_hz: z.number().positive().max(120).optional(),
  idle_timeout_seconds: z.number().positive().optional(),
});

const joinSchema = z.object({
  t: z.literal("join"),
  id: peerIdSchema,
  color: colorSchema,
});

const leaveSchema = z.object({
  t: z.literal("leave"),
  id: peerIdSchema,
});

const coordinatePairSchema = z.tuple([coordinateSchema, coordinateSchema]);

// Samme prinsipp som `tolerantPeersSchema`. Resultatet bygges uten prototype,
// slik at et oppslag på en id som ikke er med (f.eks. "constructor") gir
// `undefined` og ikke noe arvet fra `Object.prototype`.
const frameSchema = z.object({
  t: z.literal("frame"),
  c: z.record(z.string(), z.unknown()).transform((entries) => {
    const valid: Record<string, [number, number]> = Object.create(null);
    for (const [id, value] of Object.entries(entries)) {
      if (id.length === 0 || id.length > 64) continue;
      const parsed = coordinatePairSchema.safeParse(value);
      if (parsed.success) valid[id] = parsed.data;
    }
    return valid;
  }),
});

const pongSchema = z.object({ t: z.literal("pong") });

const errorSchema = z.object({
  t: z.literal("error"),
  code: z.string().max(64),
});

const serverMessageSchema = z.discriminatedUnion("t", [
  welcomeSchema,
  joinSchema,
  leaveSchema,
  frameSchema,
  pongSchema,
  errorSchema,
]);

export type CursorServerMessage = z.output<typeof serverMessageSchema>;

/**
 * Tak på hvor mye vi i det hele tatt forsøker å parse. En `welcome` med 50 peers
 * er noen få kilobyte; alt over dette er ikke en melding vi har bedt om, og
 * `JSON.parse` på en vilkårlig stor streng er en gratis måte å fryse fanen på.
 */
const MAX_MESSAGE_LENGTH = 64 * 1024;

/**
 * Parser en melding fra serveren, eller gir `null`.
 *
 * Kaster aldri. En ødelagt melding skal ikke velte socketen — den skal ignoreres,
 * slik at neste `frame` retter opp bildet av seg selv.
 */
export function parseCursorMessage(data: unknown): CursorServerMessage | null {
  if (typeof data !== "string" || data.length > MAX_MESSAGE_LENGTH) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(data);
  } catch {
    return null;
  }

  const result = serverMessageSchema.safeParse(payload);
  return result.success ? result.data : null;
}

/**
 * Bygger WebSocket-URLen for et rom.
 *
 * Gir `null` hvis `NEXT_PUBLIC_API_BASE_URL` ikke er en gyldig URL. Feilen er en
 * feilkonfigurasjon, ikke noe brukeren kan gjøre noe med, og cursors er pynt —
 * den skal droppe seg selv i stillhet framfor å kaste under render.
 */
export function cursorSocketUrl(room: string): string | null {
  try {
    const url = new URL("/site/ws/cursors", API_BASE_URL);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.searchParams.set("room", room);
    return url.toString();
  } catch {
    return null;
  }
}

/** Posisjon som andel av viewporten. Serveren klemmer verdier utenfor [0, 1]. */
export function cursorUpdateMessage(x: number, y: number): string {
  return JSON.stringify({ t: "cursor", x, y });
}

/** Holder en aktiv fane i live forbi idle-timeouten. Besvares med `pong`. */
export const CURSOR_PING_MESSAGE = JSON.stringify({ t: "ping" });
