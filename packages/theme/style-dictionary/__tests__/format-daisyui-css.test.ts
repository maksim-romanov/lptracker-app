import { $ } from "bun";

import { beforeAll, describe, expect, test } from "bun:test";

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/../..`);
});

describe("generated depthly.css", () => {
  test("has both self-contained DaisyUI theme blocks", async () => {
    const content = await Bun.file(`${import.meta.dir}/../../dist/css/depthly.css`).text();
    expect(content).toContain('name: "depthly-light";');
    expect(content).toContain("--color-primary: #CC0062;");
    expect(content).toContain('name: "depthly-dark";');
    expect(content).toContain("--color-primary: #FF007A;");
    expect(content).toContain("--color-accent: #FF80BE;");
    expect(content).toContain("--radius-box: 1.5rem;");
    expect(content).toContain("--color-info: #FF007A;");
    expect(content).toContain("--color-neutral: #EFF3F4;");
  });
});
