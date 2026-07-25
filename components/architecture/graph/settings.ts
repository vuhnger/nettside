import type { LayoutSettings } from "@/lib/architecture-layout";

/**
 * Innstillinger for arkitekturgrafen.
 *
 * `width` og `height` er en logisk `viewBox`, ikke piksler på skjermen. SVG-en
 * skaleres med CSS, så layouten regnes ut én gang og trenger ingen ny runde ved
 * resize - og den blir den samme uansett skjermstørrelse.
 *
 * Tallene er ikke gjettet, de er målt mot den ekte grafen. Første forsøk ga
 * nærmeste nodepar på 0,0 px og 45 par tettere enn 14 px. Disse verdiene gir
 * 34 px minsteavstand og ingen tette par når simuleringen har falt til ro.
 *
 * Merk at mellomtilstandene er tettere enn sluttresultatet: ved steg 0 er
 * nærmeste par 0,7 px. Et skjermbilde av en graf som fortsatt animerer sier
 * altså ingenting om layouten.
 */
export type GraphSettings = LayoutSettings & {
  width: number;
  height: number;
  /** Simuleringssteg per animasjonsramme. Høyere = raskere til ro. */
  stepsPerFrame: number;
  /** Filer med minst så mange importører får navnet sitt vist uten hover. */
  labelThreshold: number;
};

export const BASE_SETTINGS: GraphSettings = {
  width: 1100,
  height: 700,
  iterations: 300,
  idealDistanceScale: 1,
  repulsion: 1,
  attraction: 0.35,
  centeringPull: 0.02,
  isolatedPull: 4,
  temperature: 0.06,
  margin: 40,
  stepsPerFrame: 2,
  labelThreshold: 4,
};

/**
 * Mobil får samme layout, men flere steg per ramme og strengere terskel for
 * navn.
 *
 * Flere steg betyr at grafen faller til ro på færre rammer. Bevegelsen er det
 * som koster mest på en telefon, og selve steget er billig: 93 noder er rundt
 * 4300 par, så tre steg per ramme er fortsatt småpenger.
 *
 * Terskelen strammes fordi 93 filnavn på en telefonskjerm ikke er lesbart
 * uansett hvor pent det er plassert.
 */
export const MOBILE_SETTINGS: GraphSettings = {
  ...BASE_SETTINGS,
  stepsPerFrame: 3,
  labelThreshold: 5,
};

/**
 * `prefers-reduced-motion`: ingen animasjon i det hele tatt.
 *
 * Grafen regnes ferdig før første maling og står stille. Å bare senke farten
 * ville fortsatt vært vedvarende bevegelse, og det er nettopp det brukeren har
 * bedt om å slippe.
 */
export const REDUCED_SETTINGS: GraphSettings = {
  ...BASE_SETTINGS,
  stepsPerFrame: 0,
};
