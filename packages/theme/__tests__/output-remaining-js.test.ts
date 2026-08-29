import { $ } from "bun";

import { beforeAll, describe, expect, test } from "bun:test";

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/..`);
});

describe("generated typography.ts / spacing.ts / networks.ts", () => {
  test("typography.ts has all roles and derived FontWeight union", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/js/typography.ts`).text();
    expect(content).toContain('export type FontWeight = "400" | "500" | "600";');
    expect(content).toContain("display: {");
    expect(content).toContain("fontSize: 34,");
  });

  test("typography.ts exports both family shapes — PostScript for native, stack for the web", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/js/typography.ts`).text();
    // IBM Plex abbreviates the style in its PostScript names; spelling these out in full
    // makes React Native fall back to the system font without erroring.
    expect(content).toContain('sansSemiBold: "IBMPlexSans-SmBld"');
    expect(content).toContain('monoMedium: "IBMPlexMono-Medm"');
    expect(content).toContain(String.raw`sans: "\"IBM Plex Sans\", \"IBM Plex Sans Fallback\", ui-sans-serif, system-ui, sans-serif"`);
  });

  test("figures are set in the mono family, words in the sans", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/js/typography.ts`).text();
    const role = (name: string) => content.slice(content.indexOf(`${name}: {`)).slice(0, 200);
    expect(role("display")).toContain('fontFamily: "IBMPlexMono-Medm"');
    expect(role("figure")).toContain('fontFamily: "IBMPlexMono"');
    expect(role("body")).toContain('fontFamily: "IBMPlexSans"');
    expect(role("title")).toContain('fontFamily: "IBMPlexSans-SmBld"');
  });

  test("spacing.ts has the full scale plus derived key/value types", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/js/spacing.ts`).text();
    expect(content).toContain('"3xl": 32,');
    expect(content).toContain("export type SpacingKey = keyof typeof spacing;");
    expect(content).toContain("full: 9999,");
  });

  test("networks.ts has all 7 chains", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/js/networks.ts`).text();
    expect(content).toContain('ethereum: { base: "#627EEA"');
    expect(content).toContain("export type NetworkKey =");
  });
});
