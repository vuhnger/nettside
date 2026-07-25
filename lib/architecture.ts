/**
 * Modellen bak arkitekturgrafen: hvilke filer importerer hvilke, og hvilke av
 * dem havner faktisk i nettleserbunten.
 *
 * Ren logikk uten filsystem og uten TypeScript-kompilatoren. Uthentingen av
 * importer bor i `scripts/architecture/scan.ts`; her er bare grafen. Det gjør
 * lukningen testbar på små, håndskrevne grafer istedenfor på repoet selv.
 */

export const LAYERS = ["app", "components", "lib", "providers", "services"] as const;

export type Layer = (typeof LAYERS)[number];

/** Hvor koden ender opp, ikke hvor den er skrevet. */
export type Runtime = "server" | "client";

/**
 * En fil slik skanneren ser den. `imports` er interne, repo-relative stier;
 * `external` er pakkespesifikasjoner (`react`, `next/image`) som ikke løses opp
 * til filer i repoet.
 */
export type ModuleRecord = {
  id: string;
  directive: string | null;
  imports: string[];
  external: string[];
};

export type ArchitectureModule = ModuleRecord & {
  layer: Layer;
  runtime: Runtime;
};

export type ArchitectureGraph = {
  modules: ArchitectureModule[];
};

export function isLayer(value: string): value is Layer {
  return (LAYERS as readonly string[]).includes(value);
}

/**
 * Laget er første stikomponent. Kaster på ukjent lag framfor å finne opp en
 * `"other"`-bøtte: en ny toppmappe er en arkitekturendring som skal ses av et
 * menneske, ikke havne stille i en samlekategori.
 */
export function layerOf(id: string): Layer {
  const [first] = id.split("/");
  if (!isLayer(first)) {
    throw new Error(`Fant ingen kjent lag for "${id}". Legg laget til i LAYERS.`);
  }
  return first;
}

/**
 * Transitiv lukning fra hver `"use client"`-fil.
 *
 * Poenget: en fil uten `"use client"` shipper likevel til nettleseren hvis en
 * klientkomponent importerer den. Det er ikke direktivet som avgjør hvor koden
 * havner, det er nåbarheten. Derfor er det denne mengden - ikke antallet
 * `"use client"`-filer - som sier hva brukeren faktisk laster ned.
 *
 * `"use server"` stopper vandringen. Et server action kan kalles fra klienten,
 * men koden krysser aldri over; å regne den som klientkode ville overdrevet
 * bunten. Filen selv tas heller ikke med.
 */
export function clientClosure(modules: readonly ModuleRecord[]): Set<string> {
  const byId = new Map(modules.map((record) => [record.id, record]));
  const closure = new Set<string>();
  const pending = modules
    .filter((record) => record.directive === "use client")
    .map((record) => record.id);

  while (pending.length > 0) {
    const id = pending.pop() as string;
    // Importsykluser er lovlige i JavaScript, så vandringen må tåle dem.
    if (closure.has(id)) continue;

    const record = byId.get(id);
    if (record?.directive === "use server") continue;

    closure.add(id);
    for (const dependency of record?.imports ?? []) pending.push(dependency);
  }

  return closure;
}

/**
 * Sorterer deterministisk. Grafen sjekkes inn, så en stabil rekkefølge er det
 * som gjør diffen lesbar: da viser den arkitekturendringen og ikke støy fra
 * hvilken rekkefølge filsystemet svarte i.
 */
export function buildArchitectureGraph(modules: readonly ModuleRecord[]): ArchitectureGraph {
  const closure = clientClosure(modules);

  const modulesWithRuntime = modules.map((record): ArchitectureModule => {
    const runtime: Runtime = closure.has(record.id) ? "client" : "server";
    return {
      ...record,
      imports: [...record.imports].sort(),
      external: [...record.external].sort(),
      layer: layerOf(record.id),
      runtime,
    };
  });

  return {
    modules: modulesWithRuntime.sort((first, second) => first.id.localeCompare(second.id)),
  };
}
