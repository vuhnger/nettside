import { describe, expect, it } from "vitest";

import {
  buildArchitectureGraph,
  clientClosure,
  layerOf,
  type ModuleRecord,
} from "./architecture";

const mod = (
  id: string,
  imports: string[] = [],
  directive: string | null = null,
): ModuleRecord => ({ id, directive, imports, external: [] });

describe("layerOf", () => {
  it("leser laget av første stikomponent", () => {
    expect(layerOf("components/home/BentoGrid.tsx")).toBe("components");
    expect(layerOf("lib/mst.ts")).toBe("lib");
    expect(layerOf("services/api/client.ts")).toBe("services");
  });

  it("kaster på ukjent toppmappe istedenfor å gjette", () => {
    expect(() => layerOf("utils/helper.ts")).toThrow(/utils\/helper\.ts/);
  });
});

describe("clientClosure", () => {
  it("tar med filer uten direktiv som en klientkomponent importerer", () => {
    const modules = [
      mod("components/Widget.tsx", ["lib/format.ts"], "use client"),
      mod("lib/format.ts"),
    ];

    expect(clientClosure(modules)).toEqual(
      new Set(["components/Widget.tsx", "lib/format.ts"]),
    );
  });

  it("holder serverkode utenfor når ingen klientfil når den", () => {
    const modules = [
      mod("app/page.tsx", ["lib/flags.ts"]),
      mod("lib/flags.ts"),
      mod("components/Widget.tsx", [], "use client"),
    ];

    expect(clientClosure(modules).has("lib/flags.ts")).toBe(false);
  });

  it("følger importer flere nivåer ned", () => {
    const modules = [
      mod("components/Widget.tsx", ["lib/a.ts"], "use client"),
      mod("lib/a.ts", ["lib/b.ts"]),
      mod("lib/b.ts", ["lib/c.ts"]),
      mod("lib/c.ts"),
    ];

    expect(clientClosure(modules).size).toBe(4);
  });

  it("terminerer på importsykluser", () => {
    const modules = [
      mod("components/Widget.tsx", ["lib/a.ts"], "use client"),
      mod("lib/a.ts", ["lib/b.ts"]),
      mod("lib/b.ts", ["lib/a.ts"]),
    ];

    expect(clientClosure(modules)).toEqual(
      new Set(["components/Widget.tsx", "lib/a.ts", "lib/b.ts"]),
    );
  });

  it("terminerer når en fil importerer seg selv", () => {
    const modules = [mod("components/Widget.tsx", ["components/Widget.tsx"], "use client")];

    expect(clientClosure(modules)).toEqual(new Set(["components/Widget.tsx"]));
  });

  it("regner en delt fil som klient så snart én klientfil når den", () => {
    const modules = [
      mod("app/page.tsx", ["lib/shared.ts"]),
      mod("components/Widget.tsx", ["lib/shared.ts"], "use client"),
      mod("lib/shared.ts"),
    ];

    expect(clientClosure(modules).has("lib/shared.ts")).toBe(true);
  });

  it("stopper på use server, som ikke krysser over til nettleseren", () => {
    const modules = [
      mod("components/Form.tsx", ["app/actions.ts"], "use client"),
      mod("app/actions.ts", ["lib/db.ts"], "use server"),
      mod("lib/db.ts"),
    ];

    const closure = clientClosure(modules);
    expect(closure.has("app/actions.ts")).toBe(false);
    expect(closure.has("lib/db.ts")).toBe(false);
  });

  it("tåler importer til filer som ikke er skannet", () => {
    const modules = [mod("components/Widget.tsx", ["lib/mangler.ts"], "use client")];

    expect(() => clientClosure(modules)).not.toThrow();
  });
});

describe("buildArchitectureGraph", () => {
  it("sorterer moduler og importer deterministisk", () => {
    const graph = buildArchitectureGraph([
      mod("lib/z.ts"),
      mod("app/page.tsx", ["lib/z.ts", "lib/a.ts"]),
      mod("lib/a.ts"),
    ]);

    expect(graph.modules.map((record) => record.id)).toEqual([
      "app/page.tsx",
      "lib/a.ts",
      "lib/z.ts",
    ]);
    expect(graph.modules[0].imports).toEqual(["lib/a.ts", "lib/z.ts"]);
  });

  it("merker runtime ut fra nåbarhet, ikke ut fra direktivet", () => {
    const graph = buildArchitectureGraph([
      mod("components/Widget.tsx", ["lib/delt.ts"], "use client"),
      mod("lib/delt.ts"),
      mod("app/page.tsx"),
    ]);

    const runtimes = Object.fromEntries(
      graph.modules.map((record) => [record.id, record.runtime]),
    );

    expect(runtimes).toEqual({
      "app/page.tsx": "server",
      "components/Widget.tsx": "client",
      "lib/delt.ts": "client",
    });
  });
});
