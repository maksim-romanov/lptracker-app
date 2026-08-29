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

describe("generated typography.css", () => {
  test("emits both families and one Tailwind text utility per role", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/css/typography.css`).text();
    expect(content).toContain("@theme {");
    expect(content).toContain('--font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;');
    expect(content).toContain('--font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;');

    expect(content).toContain("--text-display: 34px;");
    expect(content).toContain("--text-display--line-height: 40px;");
    expect(content).toContain("--text-display--letter-spacing: -0.6px;");
    expect(content).toContain("--text-display--font-weight: 500;");
  });

  test("camelCase roles become kebab-case utilities", async () => {
    const content = await Bun.file(`${import.meta.dir}/../dist/css/typography.css`).text();
    expect(content).toContain("--text-body-small: 13px;");
    expect(content).toContain("--text-figure-small: 13px;");
    expect(content).not.toContain("--text-bodySmall");
  });
});
