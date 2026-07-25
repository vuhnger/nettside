import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { LAYERS, type Layer } from "../../../lib/architecture";
import { LAYER_COLOR_FAMILIES } from "./colors";

/**
 * Fargene til grafen leses fra det bygde temaet, ikke fra komponenten.
 *
 * Bakgrunnen er en ekte feil: første versjon brukte `base-default`, og i mørkt
 * tema havnet `lib` på 2,1:1 mot bakgrunnen. Det er under WCAG 1.4.11 sitt krav
 * på 3:1 for grafikk som bærer informasjon, og det er ikke noe man ser i en
 * kodegjennomgang - det må måles.
 *
 * Temaet er generert (`npx @digdir/designsystemet tokens build`), så det kan
 * endre seg uten at noen rører denne mappa. Da er det denne testen som fanger
 * det opp.
 */
const CSS = readFileSync(
  join(process.cwd(), "design-tokens-build/portfolio.css"),
  "utf8",
);

/** Temaet legger lyst først og mørkt bak `[data-color-scheme="dark"]`. */
const DARK_MARKER = '[data-color-scheme="dark"]';
const [lightBlock, darkBlock] = (() => {
  const index = CSS.indexOf(DARK_MARKER);
  if (index === -1) throw new Error(`Fant ikke ${DARK_MARKER} i temaet.`);
  return [CSS.slice(0, index), CSS.slice(index)];
})();

function tokenValue(block: string, token: string): string {
  const match = block.match(new RegExp(`--ds-color-${token}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Fant ingen verdi for --ds-color-${token}.`);
  return match[1];
}

/** WCAG relativ luminans. */
function luminance(hex: string): number {
  const channels = (hex.replace("#", "").match(/../g) ?? []).map((pair) => {
    const value = parseInt(pair, 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first: string, second: string): number {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Hue i grader. Brukes til å måle at to lagfarger ikke er nesten like. */
function hue(hex: string): number {
  const [red, green, blue] = (hex.replace("#", "").match(/../g) ?? []).map(
    (pair) => parseInt(pair, 16) / 255,
  );
  const max = Math.max(red, green, blue);
  const span = max - Math.min(red, green, blue);
  if (span === 0) return 0;
  const sector =
    max === red
      ? ((green - blue) / span) % 6
      : max === green
        ? (blue - red) / span + 2
        : (red - green) / span + 4;
  return ((sector * 60) + 360) % 360;
}

function hueDistance(first: string, second: string): number {
  const difference = Math.abs(hue(first) - hue(second));
  return Math.min(difference, 360 - difference);
}

const THEMES = [
  { name: "lyst", block: lightBlock },
  { name: "mørkt", block: darkBlock },
];

const layerToken = (block: string, layer: Layer, step: string) =>
  tokenValue(block, `${LAYER_COLOR_FAMILIES[layer]}-${step}`);

describe("lagfargene i arkitekturgrafen", () => {
  it("dekker hvert lag", () => {
    expect(Object.keys(LAYER_COLOR_FAMILIES).sort()).toEqual([...LAYERS].sort());
  });

  for (const theme of THEMES) {
    it(`har nok kontrast på omrisset i ${theme.name} tema`, () => {
      const background = tokenValue(theme.block, "neutral-background-default");

      for (const layer of LAYERS) {
        // Omrisset, ikke fyllet: en åpen servernode har bare omriss, og det er
        // omrisset som holder de fylte nodene fra å forsvinne i bakgrunnen.
        // 3:1 er WCAG 1.4.11 for grafikk som bærer informasjon.
        expect(
          contrast(layerToken(theme.block, layer, "border-strong"), background),
          layer,
        ).toBeGreaterThan(3);
      }
    });

    it(`holder kulørene fra hverandre i ${theme.name} tema`, () => {
      for (const first of LAYERS) {
        for (const second of LAYERS) {
          if (first >= second) continue;
          // Fyllet, for det er den kulørte flaten øyet sorterer nodene etter.
          // 25° er nok til å skille to farger; `brand2` mot `danger` lå på 25
          // og var ikke til å skille, som er grunnen til at `app` bruker
          // `warning`.
          expect(
            hueDistance(
              layerToken(theme.block, first, "base-default"),
              layerToken(theme.block, second, "base-default"),
            ),
            `${first} mot ${second}`,
          ).toBeGreaterThan(25);
        }
      }
    });
  }
});
