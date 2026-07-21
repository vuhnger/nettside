import { describe, expect, it } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  it("joins conditional class names", () => {
    expect(cn("base", false && "hidden", { active: true, disabled: false })).toBe(
      "base active",
    );
  });

  it("keeps the last conflicting Tailwind class", () => {
    expect(cn("px-2 text-sm", "px-4", ["text-lg"])).toBe("px-4 text-lg");
  });
});
