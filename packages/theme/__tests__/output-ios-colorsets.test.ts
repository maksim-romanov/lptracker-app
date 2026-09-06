import { $ } from "bun";

import { beforeAll, describe, expect, test } from "bun:test";

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/..`);
});

const assetsDir = `${import.meta.dir}/../../../apps/mobile/targets/positions-widget/Assets.xcassets`;

describe("generated iOS colorsets", () => {
  test("bgPrimary (depthly-mapped) emits light + dark appearances", async () => {
    const content = await Bun.file(`${assetsDir}/bgPrimary.colorset/Contents.json`).text();
    const parsed = JSON.parse(content);
    expect(parsed.colors[0].color.components).toEqual({ red: 1, green: 1, blue: 1, alpha: 1 });
    expect(parsed.colors[1].color.components).toEqual({ red: 18 / 255, green: 16 / 255, blue: 22 / 255, alpha: 1 });
    expect(parsed.colors[1].appearances).toEqual([{ appearance: "luminosity", value: "dark" }]);
    expect(parsed.colors[0].color["color-space"]).toBe("srgb");
    expect(parsed.colors[1].color["color-space"]).toBe("srgb");
  });

  // The alpha-based neutrals reach the widget as real alpha, not as a flattened grey — the
  // colorset composites against whatever it is drawn on, exactly as on the web.
  test("textMuted carries the neutral's alpha through to the asset catalog", async () => {
    const parsed = JSON.parse(await Bun.file(`${assetsDir}/textMuted.colorset/Contents.json`).text());
    expect(parsed.colors[0].color.components.alpha).toBeCloseTo(158 / 255, 10);
    expect(parsed.colors[1].color.components.alpha).toBeCloseTo(163 / 255, 10);
  });

  test("chainEthereum (network-mapped) has identical light/dark components", async () => {
    const content = await Bun.file(`${assetsDir}/chainEthereum.colorset/Contents.json`).text();
    const parsed = JSON.parse(content);
    expect(parsed.colors[0].color.components).toEqual(parsed.colors[1].color.components);
    expect(parsed.colors[0].color.components.red).toBeCloseTo(98 / 255, 10);
  });
});
