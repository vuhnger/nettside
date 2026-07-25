import { describe, expect, it } from "vitest";

import { estimateWidth, hiddenLabels, type LabelBox } from "./labels";

const box = (id: string, x: number, bottom: number, priority = 0): LabelBox => ({
  id,
  x,
  bottom,
  fontSize: 11,
  characters: id.length,
  priority,
});

describe("hiddenLabels", () => {
  it("skjuler ingenting når navnene ligger fra hverandre", () => {
    expect(hiddenLabels([box("lib/a.ts", 0, 0), box("lib/b.ts", 500, 400)]).size).toBe(0);
  });

  it("skjuler det ene når to navn ligger på samme punkt", () => {
    const hidden = hiddenLabels([box("lib/a.ts", 100, 100), box("lib/b.ts", 100, 100)]);
    expect(hidden.size).toBe(1);
  });

  it("lar filen med flest importører beholde navnet", () => {
    const hidden = hiddenLabels([
      box("lib/lite-brukt.ts", 100, 100, 1),
      box("lib/mye-brukt.ts", 100, 100, 9),
    ]);

    expect([...hidden]).toEqual(["lib/lite-brukt.ts"]);
  });

  it("skjuler regresjonen den ble skrevet for", () => {
    // De to ekte navnene som skrev over hverandre: nesten samme punkt, og
    // begge over navneterskelen.
    const hidden = hiddenLabels([
      box("lib/architecture.ts", 380, 415, 6),
      box("lib/architecture-layout.ts", 392, 419, 5),
    ]);

    expect([...hidden]).toEqual(["lib/architecture-layout.ts"]);
  });

  it("regner lange navn som breiere enn korte", () => {
    // `lib/a.ts` er kort nok til å gå klar, mens et langt navn på samme sted
    // strekker seg inn i naboen.
    const kort = hiddenLabels([box("a.ts", 100, 100), box("b.ts", 140, 100)]);
    const langt = hiddenLabels([
      box("components/master/edge/NetworkControls.tsx", 100, 100),
      box("components/master/edge/types.ts", 140, 100),
    ]);

    expect(kort.size).toBe(0);
    expect(langt.size).toBe(1);
  });

  it("skiller navn som ligger over hverandre men på ulik høyde", () => {
    expect(hiddenLabels([box("lib/a.ts", 100, 100), box("lib/b.ts", 100, 140)]).size).toBe(0);
  });

  it("velger det samme hver gang, også ved lik prioritet", () => {
    const boxes = [box("lib/b.ts", 100, 100, 3), box("lib/a.ts", 100, 100, 3)];

    expect([...hiddenLabels(boxes)]).toEqual([...hiddenLabels([...boxes].reverse())]);
  });

  it("tåler en tom liste", () => {
    expect(hiddenLabels([]).size).toBe(0);
  });
});

describe("estimateWidth", () => {
  it("skalerer med både tegnantall og fontstørrelse", () => {
    const small = { ...box("lib/utils.ts", 0, 0), fontSize: 11 };
    const large = { ...small, fontSize: 13 };

    expect(estimateWidth(large)).toBeGreaterThan(estimateWidth(small));
    expect(estimateWidth(small)).toBeCloseTo("lib/utils.ts".length * 11 * 0.6, 5);
  });
});
