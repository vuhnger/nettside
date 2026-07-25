import type { ModuleRecord } from "../../lib/architecture";

export const GRAPH_FILE = "data/architecture-graph.json";

/**
 * Grafen som JSON, med nøklene i fast rekkefølge.
 *
 * Både filene og importene sorteres. Uten det ville diffen avhengt av
 * rekkefølgen filsystemet ramser opp mapper i, og en generert fil som endrer seg
 * uten at noe faktisk er endret er ubrukelig i en gjennomgang.
 *
 * Bare rå fakta lagres - hvilke filer finnes og hva de importerer. Om en fil
 * ender opp på server eller klient regnes ut av `lib/architecture.ts`, så den
 * avledningen finnes på ett sted og er dekket av tester.
 */
export function serializeGraph(modules: readonly ModuleRecord[]): string {
  const payload = {
    modules: [...modules]
      .sort((first, second) => first.id.localeCompare(second.id))
      .map((record) => ({
        id: record.id,
        directive: record.directive,
        imports: [...record.imports].sort(),
        external: [...record.external].sort(),
      })),
  };

  return `${JSON.stringify(payload, null, 2)}\n`;
}
