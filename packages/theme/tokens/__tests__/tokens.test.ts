import depthly from "../color/depthly";
import networks from "../color/networks";
import palette from "../color/palette";
import spacingAndRadius from "../spacing";
import typography from "../typography";
import { describe, expect, test } from "bun:test";

describe("token source files", () => {
  test("palette has the expected ramps and singles", () => {
    expect(palette.color.palette.violet.accent.$value).toBe("#8B4DFF");
    expect(palette.color.palette.white.$value).toBe("#FFFFFF");
    expect(palette.color.palette.neutral["900"].$value).toBe("#121016");
  });

  test("every hue family carries the four steps the semantic layer draws from", () => {
    const families = ["violet", "pink", "blue", "green", "rose", "amber"] as const;
    for (const family of families) {
      const steps = Object.keys(palette.color.palette[family]).sort();
      expect(steps, family).toEqual(expect.arrayContaining(["light", "base", "vibrant", "dark"]));
    }
    // The brand ramp is the one kept whole — pastel and the theme-invariant accent are
    // only referenced by violet's own roles.
    expect(Object.keys(palette.color.palette.violet).sort()).toEqual(["accent", "base", "dark", "light", "pastel", "vibrant"]);
  });

  test("depthly dark/light have matching field sets", () => {
    const darkKeys = Object.keys(depthly.color.depthly.dark).sort();
    const lightKeys = Object.keys(depthly.color.depthly.light).sort();
    expect(darkKeys).toEqual(lightKeys);
    // One accent, both themes — the whole point of the role. Accent-coloured *text* is a
    // separate role because a single value cannot clear AA as type in both modes.
    expect(depthly.color.depthly.dark.primary.$value).toBe("{color.palette.violet.accent}");
    expect(depthly.color.depthly.light.primary.$value).toBe("{color.palette.violet.accent}");
    expect(depthly.color.depthly.dark.primaryText.$value).toBe("{color.palette.violet.base}");
    expect(depthly.color.depthly.light.primaryText.$value).toBe("{color.palette.violet.vibrant}");
  });

  test("every palette reference in depthly points at an existing palette token", () => {
    const paletteLeaf = (path: string[]): unknown =>
      path.reduce<unknown>((node, segment) => (node as Record<string, unknown> | undefined)?.[segment as never], palette.color.palette);
    for (const mode of [depthly.color.depthly.dark, depthly.color.depthly.light]) {
      for (const [field, token] of Object.entries(mode)) {
        const reference = /^\{color\.palette\.(.+)\}$/.exec((token as { $value: string }).$value);
        if (!reference) continue;
        const target = paletteLeaf(reference[1].split(".")) as { $value?: string } | undefined;
        expect(target?.$value, `${field} → ${reference[1]}`).toBeString();
      }
    }
  });

  test("networks has all 7 chains", () => {
    const chains = Object.keys(networks.color.networks)
      .filter((k) => !k.startsWith("$"))
      .sort();
    expect(chains).toEqual(["arbitrum", "avalanche", "base", "bnb", "ethereum", "optimism", "polygon"].sort());
    expect(networks.color.networks.ethereum.base.$value).toBe("#627EEA");
  });

  test("typography has all 11 roles", () => {
    expect(Object.keys(typography.typography.role).sort()).toEqual(
      ["body", "bodySmall", "button", "caption", "display", "figure", "figureSmall", "headline", "input", "label", "title"].sort(),
    );
  });

  test("every role resolves to a family the repo actually ships", () => {
    const shipped = new Set(Object.values(typography.typography.fontFamily).map((face) => face.$value));
    expect(shipped).toEqual(
      new Set([
        "IBMPlexSans",
        "IBMPlexSans-Medm",
        "IBMPlexSans-SmBld",
        "IBMPlexSans-Bold",
        "IBMPlexMono",
        "IBMPlexMono-Medm",
        "IBMPlexMono-SmBld",
      ]),
    );
  });

  test("spacing and radius scales are present", () => {
    expect(spacingAndRadius.spacing["3xl"].$value).toBe(32);
    expect(spacingAndRadius.radius.full.$value).toBe(9999);
  });
});
