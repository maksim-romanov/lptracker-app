import { $ } from "bun";

import { beforeAll, describe, expect, test } from "bun:test";

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/..`);
});

describe("generated depthly.css", () => {
  test("has :root, prefers-color-scheme, and both [data-theme] blocks", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/css/depthly.css`).text();
    expect(content).not.toContain("@plugin");
    expect(content).toContain(":root {");
    expect(content).toContain("@media (prefers-color-scheme: dark) {");
    expect(content).toContain('[data-theme="depthly-light"] {');
    expect(content).toContain('[data-theme="depthly-dark"] {');
    expect(content).toContain("--color-primary: #CC0062;");
    expect(content).toContain("--color-primary: #FF007A;");
    expect(content).toContain("--color-outline: #B5BEC4;");
    expect(content).toContain("--color-outline: #4A4D52;");
  });
});
