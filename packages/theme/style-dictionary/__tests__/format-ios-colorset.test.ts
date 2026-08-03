import { $ } from "bun";

import { beforeAll, describe, expect, test } from "bun:test";

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/../..`);
});

const assetsDir = `${import.meta.dir}/../../../../apps/mobile/targets/positions-widget/Assets.xcassets`;

describe("generated iOS colorsets", () => {
  test("bgPrimary (depthly-mapped) emits light + dark appearances", async () => {
    const content = await Bun.file(`${assetsDir}/bgPrimary.colorset/Contents.json`).text();
    const parsed = JSON.parse(content);
    expect(parsed.colors[0].color.components).toEqual({ red: 1, green: 1, blue: 1, alpha: 1 });
    expect(parsed.colors[1].color.components).toEqual({ red: 0, green: 0, blue: 0, alpha: 1 });
    expect(parsed.colors[1].appearances).toEqual([{ appearance: "luminosity", value: "dark" }]);
  });

  test("chainEthereum (network-mapped) has identical light/dark components", async () => {
    const content = await Bun.file(`${assetsDir}/chainEthereum.colorset/Contents.json`).text();
    const parsed = JSON.parse(content);
    expect(parsed.colors[0].color.components).toEqual(parsed.colors[1].color.components);
    expect(parsed.colors[0].color.components.red).toBeCloseTo(98 / 255, 10);
  });
});
