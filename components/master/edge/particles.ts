import { LINKS } from "./config";
import type { Particle } from "./types";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const CLOUD_COLOR = "var(--ds-color-accent-base-default)";
const MESH_COLOR = "var(--ds-color-warning-base-default)";

export type ParticleInputs = {
  flowCloud: boolean;
  flowMesh: boolean;
  impairmentFactor: number;
  lossLevel: boolean;
  lossDropChance: number;
};

/**
 * Lager pakkene som animeres langs de aktive lenkene. Ved høyt pakketap får
 * noen pakker et tilfeldig `dropAt`-punkt der de forsvinner underveis.
 */
export const buildParticles = ({
  flowCloud,
  flowMesh,
  impairmentFactor,
  lossLevel,
  lossDropChance,
}: ParticleInputs): Particle[] => {
  const activeLinks = LINKS.filter((link) =>
    link.kind === "cloud" ? flowCloud : flowMesh,
  );

  const particles: Particle[] = [];
  activeLinks.forEach((link) => {
    const isMesh = link.kind === "mesh";
    const duration = (isMesh ? 1.2 : 1.8) + impairmentFactor * 0.6;
    const particleCount = isMesh ? 4 : 5;
    const directions: [Particle["from"], Particle["to"]][] = [
      [link.from, link.to],
      [link.to, link.from],
    ];

    for (let index = 0; index < particleCount; index += 1) {
      const [from, to] = directions[index % directions.length];
      const dropAt =
        lossDropChance > 0 && Math.random() < lossDropChance
          ? 0.4 + Math.random() * 0.3
          : null;
      particles.push({
        id: `${link.id}-${index}`,
        from,
        to,
        duration,
        delay: (index * 0.22) % 1.1,
        dropAt,
        stutter: lossLevel,
        color: isMesh ? MESH_COLOR : CLOUD_COLOR,
      });
    }
  });

  return particles;
};

/**
 * Nøkkelbilder for hvor langt en pakke har kommet (0-1). Ved `stutter` (høyt
 * tap) rykker den frem i hakk i stedet for jevnt.
 */
export const buildProgressFrames = (stutter: boolean) => {
  if (!stutter) return { values: [0, 1], times: [0, 1] };
  const values = [0, 0.12, 0.12, 0.3, 0.3, 0.52, 0.52, 0.72, 0.72, 1];
  const times = values.map((_, index) => index / (values.length - 1));
  return { values, times };
};
