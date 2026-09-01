import { $ } from "bun";

import { beforeAll, describe, expect, test } from "bun:test";

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/..`);
});

describe("generated themes/depthly.ts", () => {
  test("contains both themes with correct primary values", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/js/themes/depthly.ts`).text();
    expect(content).toContain('import type { ColorTokens } from "../colors";');
    expect(content).toContain("export const depthlyDark: ColorTokens = {");
    expect(content).toContain('primary: "#8B4DFF",');
    expect(content).toContain('primaryText: "#A56BFF",');
    expect(content).toContain("export const depthlyLight: ColorTokens = {");
    expect(content).toContain('primaryText: "#7A1FFF",');
  });
});
