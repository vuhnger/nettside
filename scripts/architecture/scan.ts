import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import type { ModuleRecord } from "../../lib/architecture";
import { parseModule } from "./parse.ts";
import { isInternalSpecifier, resolveSpecifier, toPosix } from "./resolve.ts";

/**
 * Mappene som utgjør applikasjonen.
 *
 * Duplisert fra `LAYERS` i `lib/architecture.ts`, siden denne fila kjøres av
 * `node` og ikke skal dra applikasjonskode inn i et CLI. `architecture-rules.test.ts`
 * slår fast at de to listene er like, så dupliseringen kan ikke drifte i stillhet.
 */
export const SCANNED_DIRECTORIES = [
  "app",
  "components",
  "lib",
  "providers",
  "services",
] as const;

const SOURCE_FILE = /\.tsx?$/;
const TEST_FILE = /\.test\.tsx?$/;
const DECLARATION_FILE = /\.d\.ts$/;

function collectSourceFiles(root: string, directory: string): string[] {
  const absolute = join(root, directory);
  if (!existsSync(absolute)) return [];

  const found: string[] = [];
  const visit = (current: string) => {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) {
        visit(full);
        continue;
      }
      // Tester og typedeklarasjoner er ikke en del av applikasjonsarkitekturen
      // og shipper ikke, så de ville bare gjort grafen større uten å si noe.
      if (
        !SOURCE_FILE.test(entry) ||
        TEST_FILE.test(entry) ||
        DECLARATION_FILE.test(entry)
      ) {
        continue;
      }
      found.push(toPosix(relative(root, full)));
    }
  };

  visit(absolute);
  return found;
}

export type ScanResult = {
  modules: ModuleRecord[];
  /**
   * Interne importer som ikke lot seg løse opp. Skal alltid være tom: en
   * spesifikator som starter med `@/` eller `.` peker på en fil i repoet, og
   * finner vi den ikke, har skanneren en blindsone. En ufullstendig graf som
   * later som den er komplett er verre enn ingen graf.
   */
  unresolved: string[];
};

export function scanRepository(root: string): ScanResult {
  const files = SCANNED_DIRECTORIES.flatMap((directory) =>
    collectSourceFiles(root, directory),
  );

  const unresolved: string[] = [];
  const modules = files.map((id): ModuleRecord => {
    const { specifiers, directive } = parseModule(
      readFileSync(join(root, id), "utf8"),
      id,
    );
    const imports = new Set<string>();
    const external = new Set<string>();

    for (const specifier of specifiers) {
      const resolved = resolveSpecifier(root, id, specifier);
      if (resolved) {
        // En fil som importerer seg selv er ikke en kant i grafen.
        if (resolved !== id) imports.add(resolved);
        continue;
      }
      if (isInternalSpecifier(specifier)) {
        unresolved.push(`${id} -> ${specifier}`);
        continue;
      }
      external.add(specifier);
    }

    return { id, directive, imports: [...imports], external: [...external] };
  });

  return { modules, unresolved };
}
