import { LAYERS, type ArchitectureModule } from "@/lib/architecture";

/**
 * Teksten en skjermleser får av grafen.
 *
 * SVG-en er `role="img"`, så dette er hele innholdet - figuren har ingen
 * tilgjengelig struktur utover dette. Beskrivelsen må derfor bære formen på
 * grafen: hvor mange filer per lag, hvor mange som havner i nettleseren, og hva
 * en pil betyr.
 *
 * Den ligger i sin egen fil fordi den er en ren funksjon av grafen og dermed
 * kan testes uten å rendre noe.
 */
export function describeGraph(
  modules: readonly ArchitectureModule[],
  edgeCount: number,
): string {
  const clients = modules.filter((record) => record.runtime === "client").length;
  const perLayer = LAYERS.map(
    (layer) => `${layer} ${modules.filter((record) => record.layer === layer).length}`,
  ).join(", ");

  return (
    `Importgraf over kildekoden: ${modules.length} filer og ${edgeCount} ` +
    `avhengigheter, der en pil betyr at filen importerer den den peker på. ` +
    `${clients} filer havner i nettleserbunten, ${modules.length - clients} ` +
    `kjører bare på serveren. Filer per lag: ${perLayer}.`
  );
}

/** Radiusen til en node, gitt hvor mange filer som importerer den. */
export function nodeRadius(inDegree: number): number {
  // Minsteradius 4, ikke 3: en node på 6 px i diameter er vanskelig å treffe.
  // Kvadratrot og ikke lineært, så `lib/utils.ts` med 8 importører ikke blir en
  // flate som dekker naboene sine.
  return 4 + Math.sqrt(inDegree) * 2.4;
}
