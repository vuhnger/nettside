"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";

import { sanitizeRoom } from "@/lib/cursors";

import { useCursors, useCursorsEnabled, type LiveCursor } from "./useCursors";

/**
 * Over sideinnholdet, men under navbaren — en fremmed cursor skal ikke kunne
 * legge seg oppå navigasjonen.
 */
const OVERLAY_Z_INDEX = 30;

const CURSOR_WIDTH = 13;
const CURSOR_HEIGHT = 18;

/**
 * Musepeker med spissen i (1, 1.2), som er punktet `transform` flytter til.
 *
 * Underkanten av hodet er vannrett — de to siste punktene deler y. Det er den
 * detaljen som gjør at formen leser som en peker: heller den kanten oppover mot
 * høyre, blir det i stedet en trekant som peker til siden.
 */
const CURSOR_PATH = "M1 1.2 L1 16.6 L5.9 12.1 L11.7 12.1 Z";

type OverlaySize = { width: number; height: number };

/**
 * Måler overlayet framfor å regne i `vw`/`vh`.
 *
 * Koordinatene fra serveren er andeler, ikke piksler, og skal ganges med
 * containerstørrelsen. `100vw` er ikke den størrelsen når det finnes et
 * vertikalt rullefelt — da er `vw` bredere enn det synlige området, og hver
 * cursor havner litt for langt til høyre. Målingen tar også høyde for at
 * mobilnettlesere endrer viewporthøyden når adresselinjen gjemmer seg.
 *
 * Bruker en callback-ref og ikke `useEffect` med `[]`: overlayet finnes ikke i
 * DOM ved første render — `useCursorsEnabled` starter som `false` og slår om
 * først etter hydrering. En effekt som kjørte én gang på mount ville sett en
 * tom ref, gitt opp, og aldri kjørt igjen. Da står `size` som `null` for alltid
 * og ingen cursor tegnes, selv om både socketen og overlayet er helt i orden.
 * React 19 kaller cleanupen som callback-refen returnerer når noden løsner.
 */
function useOverlaySize(): [(node: HTMLDivElement | null) => void, OverlaySize | null] {
  const [size, setSize] = useState<OverlaySize | null>(null);

  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const apply = (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;
      setSize((current) =>
        current?.width === width && current?.height === height
          ? current
          : { width, height },
      );
    };

    // Måles med en gang, ikke bare via observeren. En ResizeObserver leverer
    // callbacken sin i «update the rendering»-steget, og det steget hoppes over
    // i en fane som ikke tegnes. Uten denne linjen står `size` som `null` helt
    // til fanen kommer i forgrunnen — og da tegnes ingen cursors i mellomtiden,
    // selv om socketen har full oversikt over rommet.
    apply(node.clientWidth, node.clientHeight);

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (box) apply(box.width, box.height);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

const CursorGlyph = ({ color }: { color: string }) => (
  <svg
    width={CURSOR_WIDTH}
    height={CURSOR_HEIGHT}
    viewBox={`0 0 ${CURSOR_WIDTH} ${CURSOR_HEIGHT}`}
    fill="none"
    aria-hidden="true"
    focusable="false"
    style={{ display: "block", filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.25))" }}
  >
    {/*
      Konturen har bakgrunnsfargen, ikke hvit: den skal skille pilen fra det som
      ligger under uansett om siden står i lyst eller mørkt tema. Serverens farge
      er validert som `#rrggbb` før den kommer hit.
    */}
    <path
      d={CURSOR_PATH}
      fill={color}
      stroke="var(--ds-color-neutral-background-default)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

const PeerCursor = ({
  peer,
  size,
  transitionMs,
}: {
  peer: LiveCursor;
  size: OverlaySize;
  transitionMs: number;
}) => (
  <span
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      // `transform` framfor `left`/`top`: posisjonene oppdateres 15 ganger i
      // sekundet, og alt annet enn transform ville utløst layout hver gang.
      transform: `translate3d(${peer.x * size.width}px, ${peer.y * size.height}px, 0)`,
      transition: `transform ${transitionMs}ms linear`,
      willChange: "transform",
    }}
  >
    <CursorGlyph color={peer.color} />
  </span>
);

/**
 * Andres pekere, live, for alle som er inne på samme side.
 *
 * Rommet er `location.pathname`, så tilstedeværelsen er per side. Hele overlayet
 * er `aria-hidden` og uten `pointer-events`: det er ren ambient informasjon som
 * ikke skal dukke opp i en skjermleser eller stjele et klikk.
 */
const LiveCursors = () => {
  const pathname = usePathname();
  const enabled = useCursorsEnabled();
  const { peers, tickHz } = useCursors(sanitizeRoom(pathname), enabled);
  const [overlayRef, size] = useOverlaySize();

  if (!enabled) return null;

  // Frames kommer med `tickHz`. Matcher overgangen den raten, er hver cursor
  // akkurat framme når neste frame lander — kortere gir hakking, lengre gir
  // etterslep.
  const transitionMs = Math.round(1000 / tickHz);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: OVERLAY_Z_INDEX,
      }}
    >
      {size
        ? peers.map((peer) => (
            <PeerCursor key={peer.id} peer={peer} size={size} transitionMs={transitionMs} />
          ))
        : null}
    </div>
  );
};

export default LiveCursors;
