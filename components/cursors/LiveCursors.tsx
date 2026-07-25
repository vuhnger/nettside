"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { sanitizeRoom } from "@/lib/cursors";

import { useCursors, useCursorsEnabled, type LiveCursor } from "./useCursors";

/**
 * Over sideinnholdet, men under navbaren — en fremmed cursor skal ikke kunne
 * legge seg oppå navigasjonen.
 */
const OVERLAY_Z_INDEX = 30;

const CURSOR_WIDTH = 14;
const CURSOR_HEIGHT = 18;

type OverlaySize = { width: number; height: number };

/**
 * Måler overlayet framfor å regne i `vw`/`vh`.
 *
 * Koordinatene fra serveren er andeler, ikke piksler, og skal ganges med
 * containerstørrelsen. `100vw` er ikke den størrelsen når det finnes et
 * vertikalt rullefelt — da er `vw` bredere enn det synlige området, og hver
 * cursor havner litt for langt til høyre. Målingen tar også høyde for at
 * mobilnettlesere endrer viewporthøyden når adresselinjen gjemmer seg.
 */
function useOverlaySize(): [React.RefObject<HTMLDivElement | null>, OverlaySize | null] {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<OverlaySize | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box || box.width <= 0 || box.height <= 0) return;
      setSize((current) =>
        current?.width === box.width && current?.height === box.height
          ? current
          : { width: box.width, height: box.height },
      );
    });

    observer.observe(element);
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
      d="M1 1 L1 16.4 L4.7 12.8 L11.4 10.8 Z"
      fill={color}
      stroke="var(--ds-color-neutral-background-default)"
      strokeWidth="1.5"
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
