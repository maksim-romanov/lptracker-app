import { $ } from "bun";

import { beforeAll, describe, expect, test } from "bun:test";

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/../..`);
});

describe("generated typography.ts / spacing.ts / networks.ts", () => {
  test("typography.ts has all roles and derived FontWeight union", async () => {
    const content = await Bun.file(`${import.meta.dir}/../../dist/js/typography.ts`).text();
    expect(content).toContain('export type FontWeight = "400" | "500" | "700";');
    expect(content).toContain("display: {");
    expect(content).toContain("fontSize: 32,");
  });

  test("spacing.ts has the full scale plus derived key/value types", async () => {
    const content = await Bun.file(`${import.meta.dir}/../../dist/js/spacing.ts`).text();
    expect(content).toContain('"3xl": 32,');
    expect(content).toContain("export type SpacingKey = keyof typeof spacing;");
    expect(content).toContain("full: 9999,");
  });

  test("networks.ts has all 7 chains", async () => {
    const content = await Bun.file(`${import.meta.dir}/../../dist/js/networks.ts`).text();
    expect(content).toContain('ethereum: { base: "#627EEA"');
    expect(content).toContain("export type NetworkKey =");
  });
});
