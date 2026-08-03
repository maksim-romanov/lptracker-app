import depthly from "../color/depthly";
import networks from "../color/networks";
import palette from "../color/palette";
import spacingAndRadius from "../spacing";
import typography from "../typography";
import { describe, expect, test } from "bun:test";

describe("token source files", () => {
  test("palette has the expected ramps and singles", () => {
    expect(palette.color.palette.neonPink["500"].$value).toBe("#FF007A");
    expect(palette.color.palette.white.$value).toBe("#FFFFFF");
    expect(palette.color.palette.neutral["950"].$value).toBe("#121212");
  });

  test("depthly dark/light have matching field sets", () => {
    const darkKeys = Object.keys(depthly.color.depthly.dark).sort();
    const lightKeys = Object.keys(depthly.color.depthly.light).sort();
    expect(darkKeys).toEqual(lightKeys);
    expect(depthly.color.depthly.dark.primary.$value).toBe("#FF007A");
    expect(depthly.color.depthly.light.primary.$value).toBe("#CC0062");
  });

  test("networks has all 7 chains", () => {
    const chains = Object.keys(networks.color.networks)
      .filter((k) => !k.startsWith("$"))
      .sort();
    expect(chains).toEqual(["arbitrum", "avalanche", "base", "bnb", "ethereum", "optimism", "polygon"].sort());
    expect(networks.color.networks.ethereum.base.$value).toBe("#627EEA");
  });

  test("typography has all 8 roles", () => {
    expect(Object.keys(typography.typography.role).sort()).toEqual(
      ["body", "bodySmall", "button", "display", "headline", "input", "label", "title"].sort(),
    );
  });

  test("spacing and radius scales are present", () => {
    expect(spacingAndRadius.spacing["3xl"].$value).toBe(32);
    expect(spacingAndRadius.radius.full.$value).toBe(9999);
  });
});
