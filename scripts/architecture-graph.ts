/**
 * Leser importgrafen ut av kildekoden og skriver den til
 * `data/architecture-graph.json`.
 *
 * Kjør etter at filer er lagt til, flyttet eller fått nye importer:
 *
 *   node scripts/architecture-graph.ts
 *
 * Filen sjekkes inn. Det er et bevisst valg framfor å generere den under bygget:
 * da havner arkitekturendringen i diffen, og «denne klientkomponenten trekker
 * plutselig inn tre nye moduler» blir noe en reviewer ser istedenfor noe som
 * skjer usett. `architecture-rules.test.ts` feiler hvis den innsjekkede filen er
 * utdatert, så den kan ikke bli liggende igjen i en gammel tilstand.
 *
 * Delene ligger i `scripts/architecture/`. Importene har `.ts`-endelse fordi
 * `node` krever den; `allowImportingTsExtensions` i tsconfig er det som gjør at
 * `tsc` godtar den samme stien.
 *
 * Kjører aldri i applikasjonen, så TypeScript-kompilatoren havner ikke i noen
 * bunt.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { scanRepository } from "./architecture/scan.ts";
import { GRAPH_FILE, serializeGraph } from "./architecture/serialize.ts";

/** Repo-roten, regnet ut fra denne filens plassering i `scripts/`. */
export function repositoryRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..");
}

function main(): void {
  const root = repositoryRoot();
  const { modules, unresolved } = scanRepository(root);

  if (unresolved.length > 0) {
    console.error("Interne importer som ikke lot seg løse opp:");
    for (const entry of unresolved) console.error(`  ${entry}`);
    console.error("Grafen ville blitt ufullstendig. Fiks oppslaget i skannekoden først.");
    process.exit(1);
  }

  const target = join(root, GRAPH_FILE);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, serializeGraph(modules));

  console.log(`Skrev ${GRAPH_FILE}: ${modules.length} filer.`);
}

// Slik at testene kan importere `repositoryRoot` uten at noe skrives til disk.
if (import.meta.main) main();
