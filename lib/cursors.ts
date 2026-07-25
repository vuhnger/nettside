/**
 * Ren logikk for live cursors: romnavn, koordinater og gjenoppkobling.
 *
 * Ligger her og ikke i hooken fordi det er nettopp disse reglene som har
 * kanttilfeller verdt å teste — en hook full av timere og sockets er vond å
 * teste, mens funksjonene under er rene og trivielle å kjøre.
 */

/**
 * Sanity-tak på hvor mange peers vi holder i minne, med vilje godt over
 * serverens romgrense (50). Å speile serverens eksakte grense ville betydd at
 * en server-side økning stille kuttet roster-en her: en `join` forbi taket
 * droppes for godt, og den personens frames matcher aldri noen — usynlig til
 * neste reconnect. Taket skal bare stoppe en server som har løpt løpsk.
 */
export const MAX_PEERS = 200;

/** Serveren avviser lengre romnavn i handshaket. */
export const CURSOR_ROOM_MAX_LENGTH = 64;

/** Serverens default når `room` ikke sendes. */
export const DEFAULT_CURSOR_ROOM = "/";

/** Tegnsettet serveren tillater i et romnavn. */
const ROOM_DISALLOWED = /[^A-Za-z0-9/_.-]/g;

/**
 * Gjør en pathname om til et lovlig romnavn.
 *
 * Serveren validerer det samme og stenger med 1008 hvis det ikke stemmer, og
 * 1008 er den ene koden vi ikke prøver på nytt. Et romnavn som ikke går gjennom
 * ville altså slått av funksjonen for den siden helt, uten noen vei tilbake.
 * Derfor renskes navnet her framfor å stole på at rutene alltid er ASCII.
 *
 * Renskingen kan i teorien slå to stier sammen til ett rom (`/a-b` og `/ab`
 * hvis skilletegnet var ulovlig). Det er greit: verste utfall er at to sider
 * deler tilstedeværelse, ikke at noe lekker.
 */
export function sanitizeRoom(pathname: string | null | undefined): string {
  if (!pathname) return DEFAULT_CURSOR_ROOM;

  const cleaned = pathname.replace(ROOM_DISALLOWED, "").slice(0, CURSOR_ROOM_MAX_LENGTH);
  return cleaned.length > 0 ? cleaned : DEFAULT_CURSOR_ROOM;
}

/**
 * Klemmer en koordinat inn i [0, 1].
 *
 * Serveren klemmer også, men frames vi mottar er tall vi skal gange med
 * containerstørrelsen og sette rett inn i en transform. En verdi utenfor
 * området ville plassert en cursor langt utenfor skjermen og potensielt gitt
 * rullefelt; et tall som ikke er endelig ville gitt `NaN` i stilen.
 */
export function clampFraction(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.min(1, Math.max(0, value));
}

/**
 * Peker-posisjon som andel av viewporten.
 *
 * Returnerer `null` når viewporten ikke har noen størrelse — det skjer for en
 * skjult iframe eller helt tidlig i oppstarten, og en divisjon på null ville
 * gitt `Infinity` videre inn i protokollen.
 */
export function viewportFraction(position: number, size: number): number | null {
  if (!Number.isFinite(position) || !Number.isFinite(size) || size <= 0) return null;
  return clampFraction(position / size);
}

/** Taket på hvor sjelden vi pinger. Holder med god margin på 15 min idle. */
export const PING_INTERVAL_MAX_MS = 30_000;

/**
 * Hvor ofte en aktiv fane skal pinge, utledet av serverens egen idle-timeout.
 *
 * `welcome` oppgir timeouten, så den skal brukes framfor å anta 15 minutter: et
 * miljø satt opp med en kortere timeout ville ellers lukket fanen før neste
 * ping, som gir en koble-opp-og-falle-ut-løkke der ingen ser noe galt lokalt.
 * En tredjedel gir rom for at én ping går tapt uten at det koster tilstedeværelsen.
 */
export function pingInterval(idleTimeoutSeconds: number | undefined): number {
  if (!idleTimeoutSeconds || !Number.isFinite(idleTimeoutSeconds)) {
    return PING_INTERVAL_MAX_MS;
  }
  // Nedre grense på ett sekund: en absurd liten timeout fra serveren skal ikke
  // kunne gjøre klienten om til noe som spammer sin egen meldingsgrense.
  return Math.max(1000, Math.min(PING_INTERVAL_MAX_MS, (idleTimeoutSeconds * 1000) / 3));
}

/** Policy-avvisning: feil origin, ulovlig rom, eller for mange faner fra samme IP. */
export const CLOSE_POLICY_VIOLATION = 1008;

/**
 * 1008 er det eneste svaret gjentakelse ikke kan endre — origin, romnavn og
 * antall faner fra denne IP-en er de samme ved neste forsøk. Å hamre på en
 * avvisning er nettopp hvordan en grense blir til et selvpåført utfall.
 */
export function shouldReconnect(closeCode: number): boolean {
  return closeCode !== CLOSE_POLICY_VIOLATION;
}

export const RECONNECT_BASE_MS = 500;
export const RECONNECT_MAX_MS = 30_000;
/** 500ms * 2^6 = 32s, altså over taket. Å telle høyere endrer ingenting. */
export const RECONNECT_MAX_ATTEMPT = 6;

/**
 * Eksponentiell backoff med jitter.
 *
 * Jitteren er poenget, ikke pynt: den interessante feilen er at serveren
 * starter på nytt, og da kobler alle åpne faner opp igjen samtidig. Med fast
 * forsinkelse kommer de tilbake i samme øyeblikk og gjør en fem sekunders
 * deploy om til et selvpåført lastspenn.
 *
 * `jitter` er en verdi i [0, 1) — `Math.random()` i produksjon, en fast verdi i
 * test. Den skalerer resultatet til [0.5, 1) av full forsinkelse, slik at taket
 * på 30s faktisk holder; å legge jitter oppå ville brutt det.
 */
export function reconnectDelay(attempt: number, jitter: number): number {
  // `Math.min`/`Math.max` slipper NaN rett gjennom, og en NaN-forsinkelse inn i
  // `setTimeout` fyrer umiddelbart — akkurat lastspennet backoffen skal hindre.
  const safeAttempt = Number.isFinite(attempt) ? attempt : 0;
  const safeJitter = Number.isFinite(jitter) ? jitter : 0;
  const bounded = Math.min(Math.max(safeAttempt, 0), RECONNECT_MAX_ATTEMPT);
  const backoff = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** bounded);
  return backoff * (0.5 + Math.min(Math.max(safeJitter, 0), 0.999) * 0.5);
}
