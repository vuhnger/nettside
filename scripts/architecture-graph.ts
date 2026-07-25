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
 * Bare rå fakta lagres - hvilke filer finnes og hva de importerer. Om en fil
 * ender opp på server eller klient regnes ut av `lib/architecture.ts`, så den
 * avledningen finnes på ett sted og er dekket av tester.
 *
 * Skanning og skriving ligger i samme fil med vilje. Et kall over filgrensen
 * hadde måttet være en verdi-import, og der er `node` og `tsc` uenige: `node`
 * krever `.ts`-endelsen, `tsc` forbyr den uten `allowImportingTsExtensions`.
 * `import.meta.main` løser det uten å røre tsconfig - modulen kan importeres av
 * testene uten at noe skrives, og skriver når filen kjøres direkte.
 *
 * Kjører aldri i applikasjonen, så TypeScript-kompilatoren havner ikke i noen
 * bunt.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, posix, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

// Type-only, og derfor gratis: Node stripper importen bort før kjøring, så
// spesifikatoren trenger ingen filendelse.
import type { ModuleRecord } from "../lib/architecture";

export const GRAPH_FILE = "data/architecture-graph.json";

/**
 * Mappene som utgjør applikasjonen.
 *
 * Duplisert fra `LAYERS` i `lib/architecture.ts` med vilje - se kommentaren over
 * om importer. `architecture-rules.test.ts` slår fast at de to listene er like,
 * så dupliseringen kan ikke drifte i stillhet.
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

/** Rekkefølgen en bundler prøver når en spesifikator mangler filendelse. */
const RESOLUTION_SUFFIXES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

function toPosix(path: string): string {
  return path.split(sep).join("/");
}

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
      if (!SOURCE_FILE.test(entry) || TEST_FILE.test(entry) || DECLARATION_FILE.test(entry)) {
        continue;
      }
      found.push(toPosix(relative(root, full)));
    }
  };

  visit(absolute);
  return found;
}

type ParsedModule = {
  specifiers: string[];
  directive: string | null;
};

/**
 * Henter ut modulspesifikatorer og et eventuelt ledende direktiv.
 *
 * Bruker TypeScript-kompilatorens egen parser framfor regex. Det koster
 * ingenting - `typescript` ligger allerede i devDependencies - og det er
 * forskjellen på å finne alle importformene og å finne de fleste:
 * `export ... from`, `import type` og `await import()` ser ikke like ut for et
 * regex, men er alle ImportDeclaration/ExportDeclaration/ImportKeyword i AST-et.
 *
 * Direktivet må stå som første setning for at Next skal godta det, så vi leter
 * bare der. En `"use client"` lenger ned i filen er en vanlig streng, og skal
 * ikke tolkes som noe annet her heller.
 */
export function parseModule(source: string, fileName: string): ParsedModule {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const specifiers: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }

    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }

    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);

  const [first] = sourceFile.statements;
  const directive =
    first && ts.isExpressionStatement(first) && ts.isStringLiteral(first.expression)
      ? first.expression.text
      : null;

  return { specifiers, directive };
}

/**
 * Løser en spesifikator til en repo-relativ fil, eller `null` hvis den peker ut
 * av repoet. `@/` er aliaset i tsconfig og peker på repo-roten.
 */
export function resolveSpecifier(
  root: string,
  fromFile: string,
  specifier: string,
): string | null {
  let base: string;
  if (specifier.startsWith("@/")) {
    base = specifier.slice(2);
  } else if (specifier.startsWith(".")) {
    base = posix.normalize(posix.join(posix.dirname(toPosix(fromFile)), specifier));
  } else {
    return null;
  }

  for (const suffix of RESOLUTION_SUFFIXES) {
    const candidate = `${base}${suffix}`;
    const absolute = join(root, candidate);
    if (existsSync(absolute) && statSync(absolute).isFile()) return candidate;
  }

  return null;
}

/** True for spesifikatorer som _skal_ peke internt, altså der et oppslag som feiler er en feil. */
function isInternalSpecifier(specifier: string): boolean {
  return specifier.startsWith("@/") || specifier.startsWith(".");
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
  const files = SCANNED_DIRECTORIES.flatMap((directory) => collectSourceFiles(root, directory));

  const unresolved: string[] = [];
  const modules = files.map((id): ModuleRecord => {
    const { specifiers, directive } = parseModule(readFileSync(join(root, id), "utf8"), id);
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

/** Repo-roten, regnet ut fra denne filens plassering i `scripts/`. */
export function repositoryRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..");
}

/** Med nøklene i fast rekkefølge, ellers blir diffen avhengig av objektlitteralet. */
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

if (import.meta.main) main();
