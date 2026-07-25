"use client";

import { useEffect, useState } from "react";

import {
  MAX_PEERS,
  clampFraction,
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
 * Hvor ofte vi sender egen posisjon. Serveren samler opp og sender ut én
 * kombinert frame ved `tick_hz` (15), så alt over det blir slått sammen til
 * samme frame uansett og koster bare batteri. Over 60 meldinger i sekundet
 * stenges koblingen.
 */
const SEND_HZ = 15;
const SEND_INTERVAL_MS = 1000 / SEND_HZ;

/** Serveren stenger etter 15 minutter uten trafikk. 30s gir god margin. */
const PING_INTERVAL_MS = 30_000;

/** Brukes til å tempo-sette interpolasjonen fram til `welcome` sier noe annet. */
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
 * To grunner til å la være, begge om brukeren framfor om nettverket:
 *
 *  - `prefers-reduced-motion`: andres cursors er kontinuerlig, uforutsigbar
 *    bevegelse styrt av noen andre. Å bare gjøre interpolasjonen kortere hjelper
 *    ikke — bevegelsen er hele greia, så da dropper vi den.
 *  - `pointer: fine`: en touch-enhet har ingen cursor som svever. Det den ville
 *    sendt er hvor fingeren traff, som er støy for alle andre i rommet.
 */
export function useCursorsEnabled(): boolean {
  // Starter som `false`: serveren rendrer uten matchMedia, og å anta «på» ville
  // gitt et hydreringsavvik på nettopp de enhetene som ikke skal ha funksjonen.
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
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
 * overleve et rombytte ved et uhell.
 */
export function useCursors(room: string, enabled: boolean): UseCursorsResult {
  const [peers, setPeers] = useState<TrackedPeer[]>([]);
  const [tickHz, setTickHz] = useState(DEFAULT_TICK_HZ);

  useEffect(() => {
    if (!enabled) return;

    const url = cursorSocketUrl(room);
    if (!url) return;

    let disposed = false;
    let socket: WebSocket | null = null;
    let attempt = 0;
    let reconnectTimer: number | undefined;
    /** Egen id, slik at vi kan droppe oss selv fra frames. */
    let selfId: string | null = null;
    /** Siste pekerposisjon, sendt på timer framfor på hver `pointermove`. */
    const pending = { x: 0, y: 0, dirty: false };

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

    const connect = () => {
      if (disposed) return;

      let opened: WebSocket;
      try {
        opened = new WebSocket(url);
      } catch {
        // Konstruktøren kaster bare på en ugyldig URL, og den er den samme
        // neste gang. Ingenting å prøve på nytt.
        return;
      }
      socket = opened;

      // Alt under er portet på denne. Hendelser fra en socket fortsetter å komme
      // etter at den er erstattet: bytt rom, og den gamle socketens `onclose`
      // fyrer *etter* at den nye er åpen — en uportet `setPeers([])` ville da
      // tømt det nye rommet.
      const isCurrent = () => !disposed && socket === opened;

      opened.onopen = () => {
        if (isCurrent()) attempt = 0;
      };

      opened.onmessage = (event: MessageEvent) => {
        if (!isCurrent()) return;
        const message = parseCursorMessage(event.data);
        if (!message) return;

        switch (message.t) {
          case "welcome": {
            selfId = message.id;
            if (message.tick_hz) setTickHz(message.tick_hz);
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
                if (!Object.hasOwn(message.c, peer.id)) return peer;
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

        if (!shouldReconnect(event.code)) return;
        reconnectTimer = window.setTimeout(connect, reconnectDelay(attempt, Math.random()));
        attempt += 1;
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const x = viewportFraction(event.clientX, window.innerWidth);
      const y = viewportFraction(event.clientY, window.innerHeight);
      if (x === null || y === null) return;
      pending.x = x;
      pending.y = y;
      pending.dirty = true;
    };

    // En styreflate fyrer godt over 100 `pointermove` i sekundet. Serveren slår
    // dem sammen uansett, så vi sampler til en variabel og sender på timer.
    const sendTimer = window.setInterval(() => {
      if (!pending.dirty) return;
      pending.dirty = false;
      trySend(cursorUpdateMessage(pending.x, pending.y));
    }, SEND_INTERVAL_MS);

    // `document.hidden` er hele mekanismen: en fane ingen ser på slutter å pinge
    // og faller ut på idle-timeout av seg selv, framfor å okkupere en plass.
    const pingTimer = window.setInterval(() => {
      if (document.hidden) return;
      trySend(CURSOR_PING_MESSAGE);
    }, PING_INTERVAL_MS);

    const onVisibilityChange = () => {
      // Baksiden av det over: fanen ble stengt mens den lå i bakgrunnen. Kommer
      // den fram igjen, skal den koble opp med en gang framfor å vente ut en
      // backoff som ble målt for en helt annen situasjon.
      if (disposed || document.hidden || socket !== null) return;
      window.clearTimeout(reconnectTimer);
      attempt = 0;
      connect();
    };

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
  }, [room, enabled]);

  return {
    peers: enabled ? peers.filter((peer) => peer.placed) : [],
    tickHz,
  };
}
