import { existsSync, statSync } from "node:fs";
import { join, posix, sep } from "node:path";

/** Rekkefølgen en bundler prøver når en spesifikator mangler filendelse. */
const RESOLUTION_SUFFIXES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

export function toPosix(path: string): string {
  return path.split(sep).join("/");
}

/**
 * Løser en spesifikator til en repo-relativ fil, eller `null` hvis den peker ut
 * av repoet. `@/` er aliaset i tsconfig og peker på repo-roten.
 *
 * Dette er den naive utgaven av noe et bibliotek gjør grundigere: den kan `@/`
 * og relative stier, ikke vilkårlige tsconfig-paths eller node_modules-oppslag.
 * Det er trygt fordi den feiler høyt og ikke stille - `scanRepository` samler
 * alt den ikke fikk løst i `unresolved`, og en test slår fast at lista er tom.
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

  // `../../../utenfor.ts` normaliserer til noe som starter med `..`, og
  // `join(root, ...)` ville da pekt ut av repoet og gitt en node med et lag som
  // ikke finnes. Null her sender den videre til `unresolved`, der en test
  // fanger den opp.
  base = posix.normalize(base);
  if (base === ".." || base.startsWith("../") || posix.isAbsolute(base)) return null;

  for (const suffix of RESOLUTION_SUFFIXES) {
    const candidate = `${base}${suffix}`;
    const absolute = join(root, candidate);
    if (existsSync(absolute) && statSync(absolute).isFile()) return candidate;
  }

  return null;
}

/**
 * True for spesifikatorer som _skal_ peke internt, altså der et oppslag som
 * feiler er en feil og ikke et eksternt bibliotek.
 */
export function isInternalSpecifier(specifier: string): boolean {
  return specifier.startsWith("@/") || specifier.startsWith(".");
}
