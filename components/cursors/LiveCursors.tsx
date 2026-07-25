"use client";

import dynamic from "next/dynamic";

import { useCursorsEnabled } from "./useCursors";

/**
 * Selve overlayet lastes først når funksjonen faktisk er på: en mobil eller en
 * bruker med `prefers-reduced-motion` skal ikke betale for kode som bare ville
 * rendret null. `ssr: false` fordi tilkoblingen uansett ikke finnes uten en
 * klient — det er ingenting å pre-rendre.
 */
const CursorOverlay = dynamic(() => import("./CursorOverlay"), { ssr: false });

const LiveCursors = () => {
  const enabled = useCursorsEnabled();

  if (!enabled) return null;

  return <CursorOverlay />;
};

export default LiveCursors;
