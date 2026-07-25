import { describe, expect, it } from "vitest";

import { repositoryRoot } from "../architecture-graph.ts";
import { isInternalSpecifier, resolveSpecifier } from "./resolve.ts";

const root = repositoryRoot();

describe("resolveSpecifier", () => {
  it("løser opp @/-aliaset mot repo-roten", () => {
    expect(resolveSpecifier(root, "app/page.tsx", "@/lib/architecture")).toBe(
      "lib/architecture.ts",
    );
  });

  it("løser opp en relativ sti mot filen den står i", () => {
    expect(resolveSpecifier(root, "scripts/architecture/scan.ts", "./resolve.ts")).toBe(
      "scripts/architecture/resolve.ts",
    );
  });

  it("gir null for pakker", () => {
    expect(resolveSpecifier(root, "app/page.tsx", "react")).toBeNull();
    expect(resolveSpecifier(root, "app/page.tsx", "next/image")).toBeNull();
  });

  it("nekter stier som peker ut av repoet", () => {
    // Null her, ikke en node med et lag som ikke finnes. Spesifikatoren er
    // intern, så `scanRepository` fører den opp som uløst og testen over
    // feiler - høyt, ikke stille.
    expect(resolveSpecifier(root, "app/page.tsx", "../../../etc/hosts")).toBeNull();
    expect(resolveSpecifier(root, "app/page.tsx", "@/../package.json")).toBeNull();
  });
});

describe("isInternalSpecifier", () => {
  it("skiller interne stier fra pakker", () => {
    expect(isInternalSpecifier("@/lib/a")).toBe(true);
    expect(isInternalSpecifier("./a")).toBe(true);
    expect(isInternalSpecifier("../a")).toBe(true);
    expect(isInternalSpecifier("react")).toBe(false);
    expect(isInternalSpecifier("next/image")).toBe(false);
  });
});
