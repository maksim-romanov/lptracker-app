import { $ } from "bun";

import { beforeAll, describe, expect, test } from "bun:test";

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/..`);
});

describe("generated colors.ts", () => {
  test("contains the ColorTokens type and palette values", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/js/colors.ts`).text();
    expect(content).toContain("export type ColorTokens = {");
    expect(content).toContain("primary: string;");
    expect(content).toContain("neonPink: {");
    expect(content).toContain('"500": "#FF007A",');
    expect(content).toContain('white: "#FFFFFF",');
    expect(content).not.toContain("blue:");
    expect(content).not.toContain("teal:");
  });
});
