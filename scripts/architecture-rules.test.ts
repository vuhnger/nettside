/**
 * Arkitekturreglene i AGENTS.md, håndhevet.
 *
 * AGENTS.md sier selv at «required CI checks are the authoritative gate» og at
 * håndhevbare regler skal ligge i ESLint eller tester. Reglene her er nettopp de
 * som ikke kan uttrykkes i ESLint, fordi de handler om forholdet mellom filer og
 * ikke om innholdet i én fil: hva som ender opp i nettleserbunten avgjøres av
 * hvem som importerer hva, og det ser en per-fil-linter aldri.
 *
 * Kjører mot en fersk skanning, ikke mot den innsjekkede JSON-filen. Ellers
 * kunne en regel «passeres» ved å redigere grafen istedenfor koden.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import ts from "typescript";

import { LAYERS, clientClosure } from "../lib/architecture";
import { repositoryRoot } from "./architecture-graph.ts";
import { SCANNED_DIRECTORIES, scanRepository } from "./architecture/scan.ts";
import { GRAPH_FILE, serializeGraph } from "./architecture/serialize.ts";

const root = repositoryRoot();
const scan = scanRepository(root);
const closure = clientClosure(scan.modules);

/**
 * Moduler som aldri får havne i nettleserbunten, med grunnen til det.
 *
 * `lib/features.ts` leser `RUNNING_HEATMAP_ENABLED` uten `NEXT_PUBLIC_`-prefiks
 * nettopp for at verdien ikke skal ut til klienten. Den intensjonen står som en
 * kommentar i filen, og en kommentar hindrer ingenting: det holder at én
 * `"use client"`-komponent importerer den, så er brytertilstanden offentlig.
 * Derfor står den her.
 */
const SERVER_ONLY_MODULES: Record<string, string> = {
  "lib/features.ts":
    "funksjonsbryterne leses uten NEXT_PUBLIC_ for å holde dem utenfor klientbunten",
};

describe("skanningen", () => {
  it("løser opp alle interne importer", () => {
    // En intern import som ikke lot seg løse opp betyr at grafen mangler kanter,
    // og da er reglene under målt på et ufullstendig bilde.
    expect(scan.unresolved).toEqual([]);
  });

  it("finner filene i alle lagene", () => {
    expect(scan.modules.length).toBeGreaterThan(0);
    const layers = new Set(scan.modules.map((record) => record.id.split("/")[0]));
    expect([...layers].sort()).toEqual([...LAYERS].sort());
  });

  it("lager ingen kanter til filer som ikke er noder", () => {
    // `app/globals.css` og `data/architecture-graph.json` løses opp fint, men
    // de er ikke kildefiler og har ingen node. En kant til dem er en påstand om
    // grafen som grafen selv motsier.
    const ids = new Set(scan.modules.map((record) => record.id));
    const dangling = scan.modules.flatMap((record) =>
      record.imports.filter((id) => !ids.has(id)).map((id) => `${record.id} -> ${id}`),
    );

    expect(dangling).toEqual([]);
  });

  it("skanner de samme mappene som grafen har lag for", () => {
    // Dupliseringen mellom SCANNED_DIRECTORIES og LAYERS er bevisst; denne
    // testen er prisen for den.
    expect([...SCANNED_DIRECTORIES]).toEqual([...LAYERS]);
  });
});

describe("den innsjekkede grafen", () => {
  it("er oppdatert", () => {
    const committed = readFileSync(join(root, GRAPH_FILE), "utf8");

    expect(
      committed,
      `${GRAPH_FILE} er utdatert. Kjør: node scripts/architecture-graph.ts`,
    ).toBe(serializeGraph(scan.modules));
  });
});

describe("server/klient-grensen", () => {
  it.each(Object.entries(SERVER_ONLY_MODULES))(
    "%s shipper ikke til nettleseren",
    (id, reason) => {
      const record = scan.modules.find((candidate) => candidate.id === id);
      expect(record, `${id} finnes ikke lenger. Oppdater SERVER_ONLY_MODULES.`).toBeDefined();

      const importers = scan.modules
        .filter((candidate) => candidate.imports.includes(id) && closure.has(candidate.id))
        .map((candidate) => candidate.id);

      expect(
        closure.has(id),
        `${id} havnet i klientbunten (${reason}). Nådd via: ${importers.join(", ")}.`,
      ).toBe(false);
    },
  );

  it("holder rutefilene på serveren", () => {
    // AGENTS.md: «Keep route `page.tsx` files server-side and move interactive
    // behavior into the smallest practical Client Component.»
    const clientPages = scan.modules
      .filter((record) => /^app\/.*page\.tsx$/.test(record.id))
      .filter((record) => record.directive === "use client")
      .map((record) => record.id);

    expect(clientPages).toEqual([]);
  });
});

/**
 * Finner kall til den globale `fetch`, via AST-et.
 *
 * Bare `fetch(...)`, `globalThis.fetch(...)` og `window.fetch(...)` teller. Et
 * hvilket som helst `.fetch()` ville også truffet metoder som tilfeldigvis
 * heter det - en klient som eksponerer `api.fetch()` er ikke det regelen
 * handler om.
 */
function findFetchCalls(source: string, fileName: string): number {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  let count = 0;
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node)) {
      const target = node.expression;
      if (ts.isIdentifier(target) && target.text === "fetch") {
        count += 1;
      } else if (
        ts.isPropertyAccessExpression(target) &&
        target.name.text === "fetch" &&
        ts.isIdentifier(target.expression) &&
        (target.expression.text === "globalThis" || target.expression.text === "window")
      ) {
        count += 1;
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sourceFile, visit);

  return count;
}

describe("dataflyten", () => {
  it("kaller fetch bare fra services", () => {
    // AGENTS.md: «Do not call `fetch` directly from `app`, `components`, or
    // `providers`. Keep external I/O and Zod schemas in `services/api`.»
    //
    // AST framfor tekstsøk: et regex på "fetch(" treffer også kommentarer og
    // strenger, og de kommentarene finnes faktisk i denne kodebasen.
    const offenders = scan.modules
      .filter((record) => !record.id.startsWith("services/"))
      .filter((record) => findFetchCalls(readFileSync(join(root, record.id), "utf8"), record.id) > 0)
      .map((record) => record.id);

    expect(offenders).toEqual([]);
  });
});
