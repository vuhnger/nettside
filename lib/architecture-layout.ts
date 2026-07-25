/**
 * Kraftbasert plassering av importgrafen, etter Fruchterman-Reingold.
 *
 * Seedet, og derfor deterministisk: grafen ser like ut ved hver lasting, og
 * layouten kan testes. En arkitekturgraf som stokker om på seg selv mellom to
 * besøk er dessuten vanskeligere å kjenne igjen enn en som står stille.
 *
 * Valget av algoritme er ikke tilfeldig. Et første forsøk med akkumulert
 * hastighet og demping endte med at nodene ble slynget ut i rammen og stablet
 * seg oppå hverandre der klampingen holdt dem fast - 45 nodepar nærmere enn
 * 14 px, og nærmeste par på 0,0 px. Fruchterman-Reingold har ingen hastighet:
 * hvert steg regner ut et forflytning fra bunnen av og begrenser det til en
 * temperatur som synker mot null. Da kan ikke energi bygge seg opp over tid.
 *
 * Simuleringen er delt i `createSimulation` og `stepSimulation` for at
 * komponenten skal kunne velge: animere at grafen faller til ro, eller hoppe
 * rett til sluttresultatet når `prefers-reduced-motion` er satt.
 */

import { LAYERS, type ArchitectureModule, type Layer } from "./architecture";

export type LayoutNode = {
  id: string;
  layer: Layer;
  /** Antall filer som importerer denne. Brukes til nodestørrelse. */
  inDegree: number;
  /** Antall kanter som berører noden, i begge retninger. 0 = helt isolert. */
  degree: number;
  x: number;
  y: number;
  displacementX: number;
  displacementY: number;
};

export type LayoutEdge = {
  from: string;
  to: string;
};

export type Simulation = {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
  step: number;
  /** Idealavstanden mellom to noder, regnet ut fra flate og nodeantall. */
  idealDistance: number;
};

export type LayoutSettings = {
  /** Antall steg før grafen regnes som falt til ro. */
  iterations: number;
  /** Ganges med sqrt(flate / noder). Under 1 gir en tettere graf. */
  idealDistanceScale: number;
  repulsion: number;
  attraction: number;
  /**
   * Hvor hardt hver node trekkes mot midten.
   *
   * Første versjon trakk mot et anker per lag, plassert på en ellipse. Det ble
   * fjernet fordi det ikke virket: målt lagskille var 18 px, altså ingen synlig
   * gruppering, mens ankeret på ellipsens ytterpunkt spikret de isolerte filene
   * ytterst i rammen og dro bounding boxen med seg. Lagene formidles av lista
   * under grafen; klyngene får kantene bestemme.
   */
  centeringPull: number;
  /**
   * Ganges med `centeringPull` for noder uten en eneste kant.
   *
   * En isolert fil har ingen tiltrekning som balanserer frastøtningen, så uten
   * dette blir den skjøvet ut i rammen og ligger alene i et hjørne. Det er ikke
   * informasjon, bare en artefakt av at ingenting holder den igjen.
   */
  isolatedPull: number;
  /** Største flytt per steg ved start, som andel av korteste side. Synker til 0. */
  temperature: number;
  margin: number;
};

/**
 * mulberry32. Liten, rask og fullstendig bestemt av seedet.
 *
 * `Math.random` kan ikke brukes: uten kontroll på tallrekka er verken
 * determinisme eller tester mulig.
 */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Vinkelen midt i lagets sektor. Brukes bare til å spre startposisjonene. */
function layerAngle(layer: Layer): number {
  const index = LAYERS.indexOf(layer);
  return (index / LAYERS.length) * Math.PI * 2;
}

/**
 * Startposisjoner: hvert lag på sin egen sektor av en ring rundt midten, med
 * seedet spredning innenfor sektoren.
 *
 * Å starte sortert framfor tilfeldig gjør at simuleringen ikke må jobbe seg ut
 * av en floke først, og at lagene fortsatt er til å kjenne igjen når den har
 * falt til ro.
 */
export function createSimulation(
  modules: readonly ArchitectureModule[],
  width: number,
  height: number,
  settings: LayoutSettings,
  seed = 1,
): Simulation {
  const random = createRandom(seed);
  const centerX = width / 2;
  const centerY = height / 2;
  const sector = (Math.PI * 2) / LAYERS.length;
  const known = new Set(modules.map((record) => record.id));

  const inDegrees = new Map<string, number>();
  const degrees = new Map<string, number>();
  const bump = (map: Map<string, number>, id: string) =>
    map.set(id, (map.get(id) ?? 0) + 1);

  for (const record of modules) {
    for (const dependency of record.imports) {
      if (!known.has(dependency)) continue;
      bump(inDegrees, dependency);
      bump(degrees, dependency);
      bump(degrees, record.id);
    }
  }

  const nodes = modules.map((record): LayoutNode => {
    const angle = layerAngle(record.layer) + (random() - 0.5) * sector * 0.9;
    const spread = 0.5 + random() * 0.7;
    return {
      id: record.id,
      layer: record.layer,
      inDegree: inDegrees.get(record.id) ?? 0,
      degree: degrees.get(record.id) ?? 0,
      x: centerX + Math.cos(angle) * width * 0.3 * spread,
      y: centerY + Math.sin(angle) * height * 0.32 * spread,
      displacementX: 0,
      displacementY: 0,
    };
  });

  const edges = modules.flatMap((record) =>
    record.imports
      .filter((dependency) => known.has(dependency))
      .map((dependency): LayoutEdge => ({ from: record.id, to: dependency })),
  );

  // sqrt(flate / noder) er FR-idealavstanden: den fyller flaten uten å klumpe.
  const idealDistance =
    settings.idealDistanceScale *
    Math.sqrt((width * height) / Math.max(1, nodes.length));

  return { nodes, edges, width, height, step: 0, idealDistance };
}

/** Unngår deling på null når to noder havner oppå hverandre. */
const EPSILON = 0.01;

/**
 * Ett steg av simuleringen. Muterer posisjonene i `simulation`.
 *
 * Frastøtning mellom alle par er O(n²), men n er antallet filer i repoet - noen
 * få hundre i verste fall - så et kvadtre ville vært kompleksitet uten gevinst.
 */
export function stepSimulation(simulation: Simulation, settings: LayoutSettings): Simulation {
  const { nodes, edges, width, height, idealDistance } = simulation;
  const byId = new Map(nodes.map((node) => [node.id, node]));

  for (const node of nodes) {
    node.displacementX = 0;
    node.displacementY = 0;
  }

  // Frastøtning: k² / d. Faller av langsommere enn 1/d², så en node som havner
  // nær en annen blir skjøvet bestemt unna uten å bli katapultert.
  for (let first = 0; first < nodes.length; first += 1) {
    for (let second = first + 1; second < nodes.length; second += 1) {
      const a = nodes[first];
      const b = nodes[second];
      const deltaX = a.x - b.x;
      const deltaY = a.y - b.y;
      const distance = Math.max(EPSILON, Math.hypot(deltaX, deltaY));
      const force =
        (settings.repulsion * idealDistance * idealDistance) / distance / distance;
      const pushX = (deltaX / distance) * force;
      const pushY = (deltaY / distance) * force;

      a.displacementX += pushX;
      a.displacementY += pushY;
      b.displacementX -= pushX;
      b.displacementY -= pushY;
    }
  }

  // Tiltrekning langs kantene: d² / k.
  for (const edge of edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) continue;

    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;
    const distance = Math.max(EPSILON, Math.hypot(deltaX, deltaY));
    const force = (settings.attraction * distance * distance) / idealDistance;
    const pullX = (deltaX / distance) * force;
    const pullY = (deltaY / distance) * force;

    from.displacementX += pullX;
    from.displacementY += pullY;
    to.displacementX -= pullX;
    to.displacementY -= pullY;
  }

  const centerX = width / 2;
  const centerY = height / 2;
  for (const node of nodes) {
    const pull =
      node.degree === 0
        ? settings.centeringPull * settings.isolatedPull
        : settings.centeringPull;
    node.displacementX += (centerX - node.x) * pull;
    node.displacementY += (centerY - node.y) * pull;
  }

  // Temperaturen synker lineært mot null. Det er dette - og ikke demping - som
  // gjør at grafen faller til ro istedenfor å svinge.
  const progress = Math.min(1, simulation.step / Math.max(1, settings.iterations));
  const maxStep = settings.temperature * Math.min(width, height) * (1 - progress);

  for (const node of nodes) {
    const magnitude = Math.hypot(node.displacementX, node.displacementY);
    if (magnitude > EPSILON) {
      const limited = Math.min(magnitude, maxStep) / magnitude;
      node.x += node.displacementX * limited;
      node.y += node.displacementY * limited;
    }

    // Innenfor rammen. Sikkerhetsnett: temperaturen skal normalt holde nodene
    // inne på egen hånd.
    node.x = Math.min(width - settings.margin, Math.max(settings.margin, node.x));
    node.y = Math.min(height - settings.margin, Math.max(settings.margin, node.y));
  }

  simulation.step += 1;
  return simulation;
}

/**
 * Skalering og forskyvning som får grafen til å fylle rammen.
 *
 * En kraftbasert graf legger seg naturlig i en rund klump, og en rund klump i et
 * liggende format lar en tredjedel av bredden stå tom. Å presse simuleringen til
 * å bli bred i stedet gjorde det bare verre - sterkere lagtrekk komprimerte den
 * (44 % til 34 % av bredden), for ankerringen er mindre enn klumpen vil være.
 *
 * Derfor skilles simuleringskoordinater fra det som males. Simuleringen får
 * legge seg som den vil, og transformen strekker resultatet ut i rammen. x og y
 * skaleres uavhengig: en graf har ingen målestokk, så det at avstander forvrenges
 * betyr ingenting - men det ville betydd noe for nodestørrelser og tekst, og
 * derfor er dette ikke en `transform` på SVG-en. Bare posisjoner sendes gjennom.
 */
export type FrameTransform = {
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
};

export function createFrameTransform(
  simulation: Simulation,
  settings: LayoutSettings,
): FrameTransform {
  const identity: FrameTransform = { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
  if (simulation.nodes.length < 2) return identity;

  const xs = simulation.nodes.map((node) => node.x);
  const ys = simulation.nodes.map((node) => node.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(EPSILON, Math.max(...xs) - minX);
  const spanY = Math.max(EPSILON, Math.max(...ys) - minY);

  const targetWidth = simulation.width - settings.margin * 2;
  const targetHeight = simulation.height - settings.margin * 2;
  const scaleX = targetWidth / spanX;
  const scaleY = targetHeight / spanY;

  return {
    scaleX,
    scaleY,
    offsetX: settings.margin - minX * scaleX,
    offsetY: settings.margin - minY * scaleY,
  };
}

export function transformX(transform: FrameTransform, x: number): number {
  return x * transform.scaleX + transform.offsetX;
}

export function transformY(transform: FrameTransform, y: number): number {
  return y * transform.scaleY + transform.offsetY;
}

/** Kjører simuleringen ferdig. Brukes når bevegelsen ikke skal vises. */
export function settleSimulation(
  simulation: Simulation,
  settings: LayoutSettings,
): Simulation {
  while (simulation.step < settings.iterations) stepSimulation(simulation, settings);
  return simulation;
}
