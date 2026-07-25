"use client";

import { useEffect, useState } from "react";

import {
  MAX_PEERS,
  clampFraction,
  pingInterval,
  reconnectDelay,
  shouldReconnect,
  viewportFraction,
} from "@/lib/cursors";
import {
  CURSOR_PING_MESSAGE,
  cursorSocketUrl,
  cursorUpdateMessage,
  parseCursorMessage,
} from "@/services/api/cursors";

/**
 * Brukes til å tempo-sette både utsending og interpolasjon fram til `welcome`
 * sier den faktiske raten. Å sende fortere enn serverens tick er bortkastet —
 * alt over slås sammen til samme frame — og å sende saktere gir hakkete
 * interpolasjon hos alle andre.
 */
const DEFAULT_TICK_HZ = 15;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(pointer: fine)";

export type LiveCursor = {
  id: string;
  color: string;
  /** Andel av containeren, i [0, 1]. */
  x: number;
  y: number;
};

type TrackedPeer = LiveCursor & {
  /**
   * En som nettopp koblet til har ingen posisjon før første `frame`. Uten dette
   * flagget måtte vi gjettet én — og en gjettet posisjon er en cursor som
   * blinker opp midt på skjermen for noen som aldri har vært der.
   */
  placed: boolean;
};

export type UseCursorsResult = {
  /** Peers med kjent posisjon. Egen cursor er ikke med. */
  peers: LiveCursor[];
  /** Serverens utsendingsrate, som interpolasjonen skal matche. */
  tickHz: number;
};

/**
 * Avgjør om cursors skal kobles opp i det hele tatt.
 *
 * Tre grunner til å la være, alle om brukeren framfor om nettverket:
 *
 *  - `prefers-reduced-motion`: andres cursors er kontinuerlig, uforutsigbar
 *    bevegelse styrt av noen andre. Å bare gjøre interpolasjonen kortere hjelper
 *    ikke — bevegelsen er hele greia, så da dropper vi den.
 *  - `pointer: fine`: en touch-enhet har ingen cursor som svever. Det den ville
 *    sendt er hvor fingeren traff, som er støy for alle andre i rommet.
 *  - container query-enheter: posisjonene tegnes i `cqw`/`cqh`. En nettleser
 *    uten støtte ville stablet alle cursors i øverste venstre hjørne.
 */
export function useCursorsEnabled(): boolean {
  // Starter som `false`: serveren rendrer uten matchMedia, og å anta «på» ville
  // gitt et hydreringsavvik på nettopp de enhetene som ikke skal ha funksjonen.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // `typeof`-sjekken er for jsdom, som mangler `CSS.supports`: en testkjøring
    // skal behandle det som manglende støtte, ikke kaste.
    if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return;
    if (!CSS.supports("transform", "translate(1cqw, 1cqh)")) return;

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const finePointer = window.matchMedia(FINE_POINTER_QUERY);
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches);

    update();
    reducedMotion.addEventListener("change", update);
    finePointer.addEventListener("change", update);
    return () => {
      reducedMotion.removeEventListener("change", update);
      finePointer.removeEventListener("change", update);
    };
  }, []);

  return enabled;
}

/**
 * Kobler til presence-rommet, strømmer egen pekerposisjon, og gir tilbake de
 * andre i rommet.
 *
 * Alt av socket, timere og gjenoppkobling lever inne i én effekt. Det er med
 * vilje: da er «rydd opp» det samme som «kjør cleanup», og en socket kan ikke
 * overleve et rombytte ved et uhell. Skal funksjonen skrus av, unmount
 * komponenten som kaller hooken — cleanupen lukker socketen.
 */
export function useCursors(room: string): UseCursorsResult {
  const [peers, setPeers] = useState<TrackedPeer[]>([]);
  const [tickHz, setTickHz] = useState(DEFAULT_TICK_HZ);

  useEffect(() => {
    const url = cursorSocketUrl(room);
    if (!url) return;

    let disposed = false;
    let socket: WebSocket | null = null;
    let attempt = 0;
    /**
     * Satt ved 1008: origin, romnavn og antall faner fra denne IP-en er de
     * samme ved neste forsøk, så avvisningen er permanent. Uten flagget ville
     * `onVisibilityChange` prøvd på nytt ved hvert fanebytte.
     */
    let refused = false;
    let reconnectTimer: number | undefined;
    let sendTimer: number | undefined;
    let pingTimer: number | undefined;
    /** Egen id, slik at vi kan droppe oss selv fra frames. */
    let selfId: string | null = null;
    /**
     * Siste pekerposisjon, sendt på timer framfor på hver `pointermove`.
     * `has` skiller «aldri beveget» fra «beveget, men ikke sendt ennå» — den
     * første skal ikke sende noe etter en reconnect, den andre skal.
     */
    const pending = { x: 0, y: 0, dirty: false, has: false };

    const clearPeers = () => setPeers((prev) => (prev.length === 0 ? prev : []));

    /**
     * `send` kan kaste hvis socketen rekker å lukke seg mellom sjekken av
     * `readyState` og selve kallet. Det er ikke en feil verdt å reagere på —
     * `onclose` er allerede på vei og tar gjenoppkoblingen.
     */
    const trySend = (payload: string) => {
      if (socket?.readyState !== WebSocket.OPEN) return;
      try {
        socket.send(payload);
      } catch {
        // Ignorert med vilje. Se over.
      }
    };

    // En styreflate fyrer godt over 100 `pointermove` i sekundet. Serveren slår
    // dem sammen uansett, så vi sampler til en variabel og sender på timer.
    // `dirty` beholdes til socketen faktisk er åpen — ellers forsvinner den
    // siste posisjonen under en reconnect, og brukeren forblir usynlig for
    // rommet til neste fysiske musebevegelse.
    const startSendTimer = (hz: number) => {
      window.clearInterval(sendTimer);
      sendTimer = window.setInterval(() => {
        if (!pending.dirty || socket?.readyState !== WebSocket.OPEN) return;
        pending.dirty = false;
        trySend(cursorUpdateMessage(pending.x, pending.y));
      }, 1000 / hz);
    };

    // `document.hidden` er hele mekanismen: en fane ingen ser på slutter å pinge
    // og faller ut på idle-timeout av seg selv, framfor å okkupere en plass.
    const startPingTimer = (ms: number) => {
      window.clearInterval(pingTimer);
      pingTimer = window.setInterval(() => {
        if (document.hidden) return;
        trySend(CURSOR_PING_MESSAGE);
      }, ms);
    };

    const onPointerMove = (event: PointerEvent) => {
      // `documentElement.clientWidth`, ikke `innerWidth`: samme boks som
      // overlayet måles mot hos mottakerne. `innerWidth` teller med et
      // eventuelt rullefelt, og den differansen ville forskjøvet cursoren
      // med rullefeltbredden hos alle andre.
      const x = viewportFraction(event.clientX, document.documentElement.clientWidth);
      const y = viewportFraction(event.clientY, document.documentElement.clientHeight);
      if (x === null || y === null) return;
      pending.x = x;
      pending.y = y;
      pending.dirty = true;
      pending.has = true;
    };

    /** En permanent avvisning skal ikke etterlate timere som spinner for ingenting. */
    const giveUp = () => {
      refused = true;
      window.clearInterval(sendTimer);
      window.clearInterval(pingTimer);
      window.removeEventListener("pointermove", onPointerMove);
    };

    const connect = () => {
      // En skjult fane kobler ikke opp — verken ved oppstart i bakgrunnen eller
      // fra en reconnect-timer som fyrte etter at fanen ble gjemt. Den skal
      // ikke holde en av rommets plasser; `onVisibilityChange` tar den når den
      // kommer fram igjen.
      if (disposed || document.hidden) return;

      let opened: WebSocket;
      try {
        opened = new WebSocket(url);
      } catch {
        // Konstruktøren kaster bare på en ugyldig URL, og den er den samme
        // neste gang. Ingenting å prøve på nytt.
        giveUp();
        return;
      }
      socket = opened;

      // Alt under er portet på denne. Hendelser fra en socket fortsetter å komme
      // etter at den er erstattet: bytt rom, og den gamle socketens `onclose`
      // fyrer *etter* at den nye er åpen — en uportet `setPeers([])` ville da
      // tømt det nye rommet.
      const isCurrent = () => !disposed && socket === opened;

      opened.onmessage = (event: MessageEvent) => {
        if (!isCurrent()) return;
        const message = parseCursorMessage(event.data);
        if (!message) return;

        switch (message.t) {
          case "welcome": {
            // Først her, ikke i `onopen`: en server i en accept-så-lukk-løkke
            // (full, restart) fullfører handshaket uten å slippe oss inn, og en
            // nullstilling der ville holdt backoffen på minimum for alltid.
            attempt = 0;
            selfId = message.id;
            if (message.tick_hz) {
              setTickHz(message.tick_hz);
              startSendTimer(message.tick_hz);
            }
            startPingTimer(pingInterval(message.idle_timeout_seconds));
            // Rommet fikk aldri siste posisjon hvis bruddet kom mellom to
            // sendinger. Har pekeren vært borti siden i det hele tatt, sendes
            // den på nytt — ellers står vi uplassert til neste musebevegelse.
            if (pending.has) pending.dirty = true;
            setPeers(
              message.peers
                .filter((peer) => peer.id !== message.id)
                .slice(0, MAX_PEERS)
                .map((peer) => ({
                  id: peer.id,
                  color: peer.color,
                  x: clampFraction(peer.x ?? 0.5),
                  y: clampFraction(peer.y ?? 0.5),
                  placed: peer.x !== undefined && peer.y !== undefined,
                })),
            );
            break;
          }

          case "join": {
            if (message.id === selfId) break;
            setPeers((prev) =>
              prev.length >= MAX_PEERS || prev.some((peer) => peer.id === message.id)
                ? prev
                : [
                    ...prev,
                    { id: message.id, color: message.color, x: 0.5, y: 0.5, placed: false },
                  ],
            );
            break;
          }

          case "leave":
            setPeers((prev) => prev.filter((peer) => peer.id !== message.id));
            break;

          case "frame": {
            // Samme bytes går til hele rommet framfor å serialiseres per
            // mottaker, så din egen posisjon ligger i frame-en. Den er allerede
            // ute av `peers` — egen id ble filtrert bort i `welcome`.
            setPeers((prev) => {
              let changed = false;
              const next = prev.map((peer) => {
                const moved = message.c[peer.id];
                if (!moved) return peer;

                const x = clampFraction(moved[0]);
                const y = clampFraction(moved[1]);
                if (peer.placed && peer.x === x && peer.y === y) return peer;

                changed = true;
                return { ...peer, x, y, placed: true };
              });
              return changed ? next : prev;
            });
            break;
          }

          case "error":
            console.warn("[cursors] avvist:", message.code);
            break;

          case "pong":
            break;
        }
      };

      opened.onclose = (event: CloseEvent) => {
        if (!isCurrent()) return;
        socket = null;
        selfId = null;
        // Tilstedeværelse overlever ikke et brudd: lista beskriver hvem som er i
        // rommet *nå*, og å la den stå igjen tegner folk som kan ha gått.
        clearPeers();

        if (!shouldReconnect(event.code)) {
          giveUp();
          return;
        }
        // En fane som ble gjemt og idle-timet ut skal *ikke* rett inn igjen —
        // det ville okkupert plassen på ubestemt tid og gjort hele
        // ping-mekanismen meningsløs. Den kobler opp igjen når den blir synlig.
        if (document.hidden) return;
        reconnectTimer = window.setTimeout(connect, reconnectDelay(attempt, Math.random()));
        attempt += 1;
      };
    };

    const onVisibilityChange = () => {
      // Motstykket til at skjulte faner ikke kobler opp: kommer fanen fram
      // igjen uten socket, skal den rett inn framfor å vente ut en backoff som
      // ble målt for en helt annen situasjon.
      if (disposed || refused || document.hidden || socket !== null) return;
      window.clearTimeout(reconnectTimer);
      connect();
    };

    startSendTimer(DEFAULT_TICK_HZ);
    startPingTimer(pingInterval(undefined));
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    connect();

    return () => {
      disposed = true;
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearTimeout(reconnectTimer);
      window.clearInterval(sendTimer);
      window.clearInterval(pingTimer);
      socket?.close(1000, "unmounted");
      socket = null;
      // Tømmes også her: ved rombytte er lukkingen vår egen, og `disposed` har
      // allerede portet `onclose` bort. Uten dette overlever forrige roms
      // cursors inn i det nye.
      clearPeers();
    };
  }, [room]);

  return {
    peers: peers.filter((peer) => peer.placed),
    tickHz,
  };
}
