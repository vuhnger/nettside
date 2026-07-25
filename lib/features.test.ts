import { describe, expect, it } from "vitest";

import { isFeatureEnabled } from "./features";

describe("isFeatureEnabled", () => {
  it("er av når variabelen ikke er satt", () => {
    expect(isFeatureEnabled(undefined)).toBe(false);
  });

  it("er av for tom streng", () => {
    // Compose og en del CI-systemer sender tom streng for en uteglemt variabel.
    expect(isFeatureEnabled("")).toBe(false);
  });

  it("slås på av 'true', uansett store bokstaver og mellomrom", () => {
    for (const value of ["true", "TRUE", "True", " true "]) {
      expect(isFeatureEnabled(value)).toBe(true);
    }
  });

  it("lar seg ikke slå på av noe annet enn 'true'", () => {
    // Bevisst strengt: en bryter som skrus på av «1» eller «yes» inviterer til
    // at noen tror «0» eller «no» skrur den av, og da er den på.
    for (const value of ["1", "yes", "on", "enabled", "false", "0", "off"]) {
      expect(isFeatureEnabled(value)).toBe(false);
    }
  });
});
