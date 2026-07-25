import graphData from "@/data/architecture-graph.json";
import { buildArchitectureGraph, type ModuleRecord } from "@/lib/architecture";

/**
 * Grafen, ferdig utledet, delt av figuren og tegnforklaringen.
 *
 * Den leses inn her og sendes ikke som props fra siden. AGENTS.md advarer mot å
 * sende store statiske datastrukturer gjennom Client Component-props: da havner
 * hele grafen i HTML-en som serialisert payload i tillegg til i bunten.
 *
 * Konsekvensen er verdt å nevne: dette er grunnen til at `lib/architecture.ts`
 * og `lib/architecture-layout.ts` selv står som klientfiler i grafen. Grafen
 * viser altså sin egen visualisering.
 *
 * Klient/server-skillet utledes av `buildArchitectureGraph` og ligger ikke i
 * JSON-en, slik at utledningen bor på ett testet sted.
 */
export const ARCHITECTURE_MODULES = buildArchitectureGraph(
  graphData.modules as ModuleRecord[],
).modules;

/** Oppslag framfor indeks: simuleringsnodene ligger ikke i samme rekkefølge. */
export const RUNTIME_OF = new Map(
  ARCHITECTURE_MODULES.map((record) => [record.id, record.runtime]),
);
