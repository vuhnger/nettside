/**
 * Hvilke filnavn det er plass til.
 *
 * Uten dette la `lib/architecture.ts` og `lib/architecture-layout.ts` seg rett
 * oppå hverandre til uleselig grøt: de ligger tett, og begge har nok importører
 * til å vise navn.
 *
 * Ligger her som en ren funksjon fordi den ellers bare ville blitt kjørt av
 * layouten i nettleseren, og da er kollisjonene vanskelige å framprovosere. Her
 * kan de skrives som tall.
 */
export type LabelBox = {
  id: string;
  /** Midtpunktet vannrett. Navnene er sentrert over noden. */
  x: number;
  /** Grunnlinjen. Navnet strekker seg `fontSize` oppover derfra. */
  bottom: number;
  fontSize: number;
  /** Antall tegn. Bredden anslås av dette, se `estimateWidth`. */
  characters: number;
  /** Høyere vinner plassen ved kollisjon. Antall importører i praksis. */
  priority: number;
};

/**
 * Bredden på et navn, anslått fra tegnantall.
 *
 * `getComputedTextLength` ville vært eksakt, men tvinger fram en
 * layout-beregning per navn per animasjonsramme. Navnene er monospace, så
 * tegnbredden er en fast andel av fontstørrelsen, og et anslag er nøyaktig nok
 * til å avgjøre om to bokser krysser.
 */
export function estimateWidth(box: LabelBox): number {
  return box.characters * box.fontSize * 0.6;
}

function overlaps(first: LabelBox, second: LabelBox): boolean {
  const firstWidth = estimateWidth(first) / 2;
  const secondWidth = estimateWidth(second) / 2;
  return (
    first.x - firstWidth < second.x + secondWidth &&
    first.x + firstWidth > second.x - secondWidth &&
    first.bottom - first.fontSize < second.bottom &&
    first.bottom > second.bottom - second.fontSize
  );
}

/**
 * Navnene som må vike, gitt at de viktigste får plassen først.
 *
 * Grådig og ikke optimal: å finne det største settet uten kollisjoner er dyrt,
 * og en graf som faller til ro flytter boksene hver ramme uansett. Det som
 * betyr noe er at valget er stabilt og at de mest importerte filene vinner.
 */
export function hiddenLabels(boxes: readonly LabelBox[]): Set<string> {
  const hidden = new Set<string>();
  const placed: LabelBox[] = [];

  // Lik prioritet avgjøres av id, ellers ville to like viktige filer kunnet
  // bytte på å vike mellom rammene og blinke.
  const order = [...boxes].sort(
    (first, second) =>
      second.priority - first.priority || first.id.localeCompare(second.id),
  );

  for (const box of order) {
    if (placed.some((other) => overlaps(box, other))) hidden.add(box.id);
    else placed.push(box);
  }

  return hidden;
}
