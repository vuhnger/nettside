import { describe, expect, it } from "vitest";

import { parseModule } from "./parse.ts";

const specifiers = (source: string): string[] =>
  parseModule(source, "components/Widget.tsx").specifiers;

describe("parseModule", () => {
  it("finner de vanlige importformene", () => {
    expect(specifiers(`import { a } from "./a";`)).toEqual(["./a"]);
    expect(specifiers(`import b from "./b";`)).toEqual(["./b"]);
    expect(specifiers(`import * as c from "./c";`)).toEqual(["./c"]);
    expect(specifiers(`export { d } from "./d";`)).toEqual(["./d"]);
    expect(specifiers(`export * from "./e";`)).toEqual(["./e"]);
    expect(specifiers(`const f = await import("./f");`)).toEqual(["./f"]);
  });

  it("tar med importer som bare kjøres for effekten sin", () => {
    // `import "./styles.css"` har ingen bindinger, men filen lastes.
    expect(specifiers(`import "./styles.css";`)).toEqual(["./styles.css"]);
  });

  describe("type-importer", () => {
    // Disse forsvinner under kompilering, så de er ikke kanter i en graf som
    // svarer på hva nettleseren laster ned.
    it("dropper import type", () => {
      expect(specifiers(`import type { A } from "./a";`)).toEqual([]);
      expect(specifiers(`import type A from "./a";`)).toEqual([]);
    });

    it("dropper import { type A }", () => {
      expect(specifiers(`import { type A } from "./a";`)).toEqual([]);
      expect(specifiers(`import { type A, type B } from "./a";`)).toEqual([]);
    });

    it("dropper export type", () => {
      expect(specifiers(`export type { A } from "./a";`)).toEqual([]);
      expect(specifiers(`export { type A } from "./a";`)).toEqual([]);
    });

    it("beholder importen når minst én binding er en verdi", () => {
      expect(specifiers(`import { type A, b } from "./a";`)).toEqual(["./a"]);
      expect(specifiers(`import A, { type B } from "./a";`)).toEqual(["./a"]);
      expect(specifiers(`export { type A, b } from "./a";`)).toEqual(["./a"]);
    });

    it("beholder export * selv om alt som eksporteres skulle være typer", () => {
      // Uten å slå opp i modulen på andre siden er det umulig å vite, og en
      // kant for mye er tryggere enn en for lite.
      expect(specifiers(`export * from "./a";`)).toEqual(["./a"]);
    });
  });

  describe("direktivet", () => {
    it("leser et ledende direktiv", () => {
      expect(parseModule(`"use client";\nexport const a = 1;`, "a.ts").directive).toBe(
        "use client",
      );
      expect(parseModule(`"use server";`, "a.ts").directive).toBe("use server");
    });

    it("ser bort fra en streng som ikke står først", () => {
      const source = `import { a } from "./a";\n"use client";`;
      expect(parseModule(source, "a.ts").directive).toBeNull();
    });

    it("gir null når filen ikke har noe direktiv", () => {
      expect(parseModule(`export const a = 1;`, "a.ts").directive).toBeNull();
    });
  });
});
