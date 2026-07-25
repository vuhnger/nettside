// Bare typeimport. En verdiimport av `@/lib/architecture` her ville brutt
// `colors.test.ts`, siden vitest i dette repoet ikke resolverer `@/`-aliaset.
import type { Layer } from "@/lib/architecture";

/**
 * Én farge per lag, delt mellom grafen og tegnforklaringen.
 *
 * Hvert lag bruker to trinn av samme familie, og det er målt fram:
 *
 * `base-default` som fyll. Det er det kulørte trinnet - blå, turkis, ambra,
 * rød, grønn - og kulør er det øyet sorterer nodene etter.
 *
 * `border-strong` som omriss. Fyllet alene holder ikke: i mørkt tema har
 * `lib` sitt fyll bare 2,1:1 kontrast mot bakgrunnen og `app` 2,38:1, under
 * WCAG 1.4.11 sitt krav på 3:1 for grafikk som bærer informasjon. Omrisset
 * ligger på 4,56:1 eller mer i begge tema og bærer kontrasten. Det er også
 * omrisset som gjør de åpne servernodene synlige, siden de ikke har fyll.
 *
 * Familievalget er heller ikke tilfeldig. `brand2` (hue 25) ligger for nær
 * `danger` (hue 0) til å skilles; `warning` (hue 37) gir `app` en kulør som
 * står 37° fra nærmeste nabo. Et forsøk på å optimere alle fem fritt over
 * tokensettet endte med to blåtoner og en nesten-svart, så begrensningen til
 * én familie per lag er med vilje.
 *
 * `colors.test.ts` leser de bygde tokenene og feiler hvis et temabytte bryter
 * kontrastgrensen eller lar to lag få nesten samme kulør.
 *
 * Farge er aldri eneste bærer av informasjon: filnavnet starter med laget, og
 * tegnforklaringen står over grafen.
 */
export const LAYER_COLOR_FAMILIES: Record<Layer, string> = {
  app: "warning",
  components: "accent",
  lib: "brand1",
  providers: "danger",
  services: "success",
};

const byLayer = (step: string) =>
  Object.fromEntries(
    Object.entries(LAYER_COLOR_FAMILIES).map(([layer, family]) => [
      layer,
      `var(--ds-color-${family}-${step})`,
    ]),
  ) as Record<Layer, string>;

/** Kuløren. Fyller klientnodene, og er prikken i tegnforklaringen. */
export const LAYER_FILL = byLayer("base-default");

/** Kontrasten. Omriss på alle noder, og eneste farge på de åpne servernodene. */
export const LAYER_STROKE = byLayer("border-strong");

/**
 * Kantene er nøytrale med vilje. Ga vi hver strek fargen til laget sitt, ville
 * 132 streker konkurrert med de 85 nodene om den samme fargekoden.
 */
export const EDGE_COLOR = "var(--ds-color-neutral-border-strong)";
export const EDGE_ACTIVE_COLOR = "var(--ds-color-neutral-text-default)";
export const LABEL_COLOR = "var(--ds-color-neutral-text-default)";
