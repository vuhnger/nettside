import { describe, expect, it } from "vitest";

import { buildArchitectureGraph, type ModuleRecord } from "./architecture";
import {
  createFrameTransform,
  createSimulation,
  settleSimulation,
  stepSimulation,
  transformX,
  transformY,
  type LayoutSettings,
} from "./architecture-layout";

const SETTINGS: LayoutSettings = {
  iterations: 300,
  idealDistanceScale: 1,
  repulsion: 1,
  attraction: 0.35,
  centeringPull: 0.006,
  isolatedPull: 12,
  temperature: 0.06,
  margin: 24,
};

const WIDTH = 900;
const HEIGHT = 600;

const mod = (id: string, imports: string[] = []): ModuleRecord => ({
  id,
  directive: null,
  imports,
  external: [],
});

const graphOf = (records: ModuleRecord[]) => buildArchitectureGraph(records).modules;

const settled = (records: ModuleRecord[], seed = 1) =>
  settleSimulation(
    createSimulation(graphOf(records), WIDTH, HEIGHT, SETTINGS, seed),
    SETTINGS,
  );

const distance = (
  simulation: ReturnType<typeof settled>,
  first: string,
  second: string,
): number => {
  const a = simulation.nodes.find((node) => node.id === first);
  const b = simulation.nodes.find((node) => node.id === second);
  if (!a || !b) throw new Error(`Fant ikke ${first} eller ${second}.`);
  return Math.hypot(a.x - b.x, a.y - b.y);
};

describe("createSimulation", () => {
  it("gir samme layout for samme seed", () => {
    const records = [
      mod("app/page.tsx", ["lib/a.ts", "lib/b.ts"]),
      mod("lib/a.ts", ["lib/b.ts"]),
      mod("lib/b.ts"),
      mod("components/Widget.tsx", ["lib/a.ts"]),
    ];

    const first = settled(records).nodes.map((node) => [node.x, node.y]);
    const second = settled(records).nodes.map((node) => [node.x, node.y]);

    expect(first).toEqual(second);
  });

  it("gir ulik layout for ulikt seed", () => {
    const records = [mod("app/page.tsx", ["lib/a.ts"]), mod("lib/a.ts")];

    expect(settled(records, 1).nodes.map((node) => node.x)).not.toEqual(
      settled(records, 99).nodes.map((node) => node.x),
    );
  });

  it("teller hvor mange som importerer hver fil", () => {
    const simulation = settled([
      mod("app/page.tsx", ["lib/delt.ts"]),
      mod("components/Widget.tsx", ["lib/delt.ts"]),
      mod("lib/delt.ts"),
    ]);

    const inDegrees = Object.fromEntries(
      simulation.nodes.map((node) => [node.id, node.inDegree]),
    );

    expect(inDegrees).toEqual({
      "app/page.tsx": 0,
      "components/Widget.tsx": 0,
      "lib/delt.ts": 2,
    });
  });

  it("dropper kanter til filer som ikke er i grafen", () => {
    const simulation = settled([mod("app/page.tsx", ["lib/finnes-ikke.ts"])]);

    expect(simulation.edges).toEqual([]);
  });
});

describe("stepSimulation", () => {
  it("holder alle noder innenfor rammen", () => {
    // Mange noder uten kanter er verste tilfelle: bare frastøtning, ingenting
    // som holder dem sammen.
    const records = Array.from({ length: 40 }, (_, index) => mod(`lib/fil-${index}.ts`));
    const simulation = settled(records);

    for (const node of simulation.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(SETTINGS.margin);
      expect(node.x).toBeLessThanOrEqual(WIDTH - SETTINGS.margin);
      expect(node.y).toBeGreaterThanOrEqual(SETTINGS.margin);
      expect(node.y).toBeLessThanOrEqual(HEIGHT - SETTINGS.margin);
    }
  });

  it("stabler ikke nodene oppå hverandre", () => {
    // Regresjonstest. Første versjon brukte akkumulert hastighet med demping, og
    // da ble nodene slynget ut i rammen og lagt i haug der klampingen stoppet
    // dem: nærmeste par 0,0 px. En layout kan se ferdig ut og likevel være
    // ubrukelig, så avstanden må måles og ikke øyemåles.
    const records = Array.from({ length: 40 }, (_, index) =>
      mod(`${index % 2 === 0 ? "lib" : "components"}/fil-${index}.ts`),
    );
    const simulation = settled(records);

    let closest = Infinity;
    for (let first = 0; first < simulation.nodes.length; first += 1) {
      for (let second = first + 1; second < simulation.nodes.length; second += 1) {
        const a = simulation.nodes[first];
        const b = simulation.nodes[second];
        closest = Math.min(closest, Math.hypot(a.x - b.x, a.y - b.y));
      }
    }

    expect(closest).toBeGreaterThan(15);
  });

  it("frastøter etter 1/d², ikke etter 1/d", () => {
    // Fruchterman-Reingold oppgir k²/d. Denne layouten bruker k²/d² med vilje,
    // og forskjellen er målbar: k²/d ga 18,1 px minsteavstand på den ekte
    // grafen på sitt aller beste, mot 34,0 px for k²/d². Uten denne testen er
    // det bare en kommentar som skiller de to, og en kommentar stopper ingen
    // fra å «rette» formelen tilbake til læreboka.
    //
    // Ingen sentertrekk og ingen kanter, så det eneste som flytter noden er
    // frastøtningen fra den andre. Temperaturen settes høyt nok til at
    // klampen ikke slår inn: ellers ville begge kraftlovene endt på samme
    // maksflytt, og da måler testen klampen istedenfor formelen.
    const settings: LayoutSettings = { ...SETTINGS, centeringPull: 0, temperature: 5 };

    const displacementAt = (separation: number): number => {
      const simulation = createSimulation(
        graphOf([mod("lib/a.ts"), mod("lib/b.ts")]),
        WIDTH,
        HEIGHT,
        settings,
        1,
      );
      const [a, b] = simulation.nodes;
      a.x = WIDTH / 2 - separation / 2;
      b.x = WIDTH / 2 + separation / 2;
      a.y = HEIGHT / 2;
      b.y = HEIGHT / 2;

      const startX = a.x;
      stepSimulation(simulation, settings);
      return Math.abs(a.x - startX);
    };

    // Dobbelt så langt unna skal gi en fjerdedel av kraften. Halvparten ville
    // betydd k²/d.
    const near = displacementAt(100);
    const far = displacementAt(200);

    expect(near / far).toBeCloseTo(4, 1);
  });

  it("gir aldri NaN, heller ikke når to noder starter oppå hverandre", () => {
    const records = [mod("lib/a.ts"), mod("lib/b.ts")];
    const simulation = createSimulation(graphOf(records), WIDTH, HEIGHT, SETTINGS, 1);
    // Tvinger fram delingen på null som EPSILON skal beskytte mot.
    simulation.nodes[1].x = simulation.nodes[0].x;
    simulation.nodes[1].y = simulation.nodes[0].y;

    settleSimulation(simulation, SETTINGS);

    for (const node of simulation.nodes) {
      expect(Number.isFinite(node.x)).toBe(true);
      expect(Number.isFinite(node.y)).toBe(true);
    }
  });

  it("trekker filer som importerer hverandre nærmere enn filer uten kant", () => {
    const records = [
      mod("lib/knyttet-a.ts", ["lib/knyttet-b.ts"]),
      mod("lib/knyttet-b.ts"),
      mod("lib/alene-a.ts"),
      mod("lib/alene-b.ts"),
    ];
    const simulation = settled(records);

    expect(distance(simulation, "lib/knyttet-a.ts", "lib/knyttet-b.ts")).toBeLessThan(
      distance(simulation, "lib/alene-a.ts", "lib/alene-b.ts"),
    );
  });

  it("teller stegene, så avkjølingen vet hvor langt den har kommet", () => {
    const simulation = createSimulation(graphOf([mod("lib/a.ts")]), WIDTH, HEIGHT, SETTINGS);
    expect(simulation.step).toBe(0);

    stepSimulation(simulation, SETTINGS);
    expect(simulation.step).toBe(1);
  });

  it("faller til ro, altså beveger seg mindre mot slutten enn i starten", () => {
    const records = [
      mod("app/page.tsx", ["lib/a.ts", "lib/b.ts"]),
      mod("components/Widget.tsx", ["lib/a.ts"]),
      mod("lib/a.ts", ["lib/b.ts"]),
      mod("lib/b.ts"),
      mod("services/api/client.ts"),
    ];

    const movement = (simulation: ReturnType<typeof settled>) => {
      const before = simulation.nodes.map((node) => ({ x: node.x, y: node.y }));
      stepSimulation(simulation, SETTINGS);
      return simulation.nodes.reduce(
        (total, node, index) => total + Math.hypot(node.x - before[index].x, node.y - before[index].y),
        0,
      );
    };

    const simulation = createSimulation(graphOf(records), WIDTH, HEIGHT, SETTINGS, 1);
    stepSimulation(simulation, SETTINGS);
    const early = movement(simulation);

    while (simulation.step < SETTINGS.iterations - 1) stepSimulation(simulation, SETTINGS);
    const late = movement(simulation);

    expect(late).toBeLessThan(early);
  });
});

describe("createFrameTransform", () => {
  const records = [
    mod("app/page.tsx", ["lib/a.ts", "lib/b.ts"]),
    mod("components/Widget.tsx", ["lib/a.ts"]),
    mod("lib/a.ts", ["lib/b.ts"]),
    mod("lib/b.ts"),
    mod("services/api/client.ts"),
    mod("providers/Provider.tsx"),
  ];

  it("fyller rammen i begge retninger", () => {
    const simulation = settled(records);
    const transform = createFrameTransform(simulation, SETTINGS);
    const xs = simulation.nodes.map((node) => transformX(transform, node.x));
    const ys = simulation.nodes.map((node) => transformY(transform, node.y));

    expect(Math.min(...xs)).toBeCloseTo(SETTINGS.margin, 5);
    expect(Math.max(...xs)).toBeCloseTo(WIDTH - SETTINGS.margin, 5);
    expect(Math.min(...ys)).toBeCloseTo(SETTINGS.margin, 5);
    expect(Math.max(...ys)).toBeCloseTo(HEIGHT - SETTINGS.margin, 5);
  });

  it("beholder rekkefølgen på aksene, altså snur ikke grafen", () => {
    const simulation = settled(records);
    const transform = createFrameTransform(simulation, SETTINGS);
    const sorted = [...simulation.nodes].sort((first, second) => first.x - second.x);

    const transformed = sorted.map((node) => transformX(transform, node.x));
    for (let index = 1; index < transformed.length; index += 1) {
      expect(transformed[index]).toBeGreaterThanOrEqual(transformed[index - 1]);
    }
  });

  it("er identitet for under to noder, der en ramme ikke er definert", () => {
    const simulation = settled([mod("lib/alene.ts")]);
    const transform = createFrameTransform(simulation, SETTINGS);

    expect(transform).toEqual({ scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 });
  });

  it("gir ikke NaN når alle nodene ligger på samme punkt", () => {
    const simulation = settled([mod("lib/a.ts"), mod("lib/b.ts")]);
    for (const node of simulation.nodes) {
      node.x = 100;
      node.y = 100;
    }
    const transform = createFrameTransform(simulation, SETTINGS);

    expect(Number.isFinite(transformX(transform, 100))).toBe(true);
    expect(Number.isFinite(transformY(transform, 100))).toBe(true);
  });
});

describe("settleSimulation", () => {
  it("kjører til iterasjonsgrensen", () => {
    const simulation = settled([mod("lib/a.ts"), mod("lib/b.ts", ["lib/a.ts"])]);
    expect(simulation.step).toBe(SETTINGS.iterations);
  });

  it("tåler en tom graf", () => {
    const simulation = createSimulation([], WIDTH, HEIGHT, SETTINGS);
    expect(() => settleSimulation(simulation, SETTINGS)).not.toThrow();
    expect(simulation.nodes).toEqual([]);
  });

  it("tåler én node uten kanter", () => {
    const simulation = settled([mod("lib/alene.ts")]);
    expect(simulation.nodes).toHaveLength(1);
    expect(Number.isFinite(simulation.nodes[0].x)).toBe(true);
  });
});
