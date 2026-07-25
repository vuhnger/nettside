"use client";

import { memo } from "react";
import { usePathname } from "next/navigation";

import { sanitizeRoom } from "@/lib/cursors";

import { useCursors, type LiveCursor } from "./useCursors";

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

/**
 * Memoisert fordi posisjonen ikke bor her: forelderen re-rendrer 15 ganger i
 * sekundet per frame, men fargen er konstant per peer, så SVG-en trenger aldri
 * å reconciles på nytt.
 */
const CursorGlyph = memo(({ color }: { color: string }) => (
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
));
CursorGlyph.displayName = "CursorGlyph";

const PeerCursor = ({ peer, transitionMs }: { peer: LiveCursor; transitionMs: number }) => (
  <span
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      // Koordinatene fra serveren er andeler av containeren, og `cqw`/`cqh` er
      // nettopp prosent av containerens størrelse — så posisjoneringen trenger
      // ingen måling i JS i det hele tatt. `transform` framfor `left`/`top`:
      // posisjonene oppdateres 15 ganger i sekundet, og alt annet enn transform
      // ville utløst layout hver gang.
      transform: `translate3d(${peer.x * 100}cqw, ${peer.y * 100}cqh, 0)`,
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
 *
 * Overlayet dekker viewporten minus et eventuelt rullefelt — samme boks som
 * avsenderne normaliserer mot (`documentElement.clientWidth`). `100vw` ville
 * talt med rullefeltet og skjøvet hver cursor litt mot høyre. `z-30` legger
 * cursorene over innholdet, men under navbaren (`z-50`).
 */
const CursorOverlay = () => {
  const pathname = usePathname();
  const { peers, tickHz } = useCursors(sanitizeRoom(pathname));

  // Frames kommer med `tickHz`. Matcher overgangen den raten, er hver cursor
  // akkurat framme når neste frame lander — kortere gir hakking, lengre gir
  // etterslep.
  const transitionMs = Math.round(1000 / tickHz);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{ containerType: "size" }}
    >
      {peers.map((peer) => (
        <PeerCursor key={peer.id} peer={peer} transitionMs={transitionMs} />
      ))}
    </div>
  );
};

export default CursorOverlay;
