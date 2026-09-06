import { $ } from "bun";

import { fallbackOverrides, families } from "../fonts/manifest";
import { beforeAll, describe, expect, test } from "bun:test";

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/..`);
});

const sheet = (name: string) => Bun.file(`${import.meta.dir}/../dist/css/${name}`).text();

describe("fallback metric overrides", () => {
  // Worked by hand from the @capsizecss/metrics numbers in the manifest, so a wrong edit to the
  // formula fails here rather than showing up as a layout shift nobody traces back to fonts.
  test("scale Arial onto IBM Plex Sans", () => {
    expect(fallbackOverrides(families.sans)).toEqual({
      "size-adjust": "101.166%",
      "ascent-override": "101.318%",
      "descent-override": "27.183%",
      "line-gap-override": "0%",
    });
  });

  test("scale Courier New onto IBM Plex Mono", () => {
    // Monospace against monospace, so the widths already almost agree.
    expect(fallbackOverrides(families.mono)).toEqual({
      "size-adjust": "99.984%",
      "ascent-override": "102.517%",
      "descent-override": "27.504%",
      "line-gap-override": "0%",
    });
  });
});

describe("generated @font-face sheets", () => {
  test("/app declares every face against every subset of its family", async () => {
    const content = await sheet("fonts-app.css");
    // 4 sans faces x 6 subsets + 3 mono faces x 5 subsets, plus one fallback per family.
    expect(content.match(/@font-face/g)).toHaveLength(4 * 6 + 3 * 5 + 2);
    expect(content).toContain('src: url("/static/fonts/IBMPlexSans-Regular-Latin1.woff2") format("woff2");');
    expect(content).toContain("unicode-range: U+0400-045F");
    expect(content).toContain("font-display: swap;");
  });

  test("/app registers a metric-matched stand-in per family", async () => {
    const content = await sheet("fonts-app.css");
    expect(content).toContain('font-family: "IBM Plex Sans Fallback";');
    expect(content).toContain('src: local("Arial");');
    expect(content).toContain("size-adjust: 101.166%;");
    expect(content).toContain('font-family: "IBM Plex Mono Fallback";');
    expect(content).toContain('src: local("Courier New");');
  });

  test("the landing sheet carries only the two faces it sets", async () => {
    const content = await sheet("fonts-landing.css");
    expect(content.match(/@font-face/g)).toHaveLength(2 * 6 + 1);
    expect(content).toContain('url("/assets/fonts/IBMPlexSans-SemiBold-Latin1.woff2")');
    expect(content).not.toContain("IBMPlexMono");
  });

  test("the stack puts the stand-in between the webfont and the generics", async () => {
    const content = await sheet("typography.css");
    expect(content).toContain('--font-sans: "IBM Plex Sans", "IBM Plex Sans Fallback", ui-sans-serif, system-ui, sans-serif;');
  });
});
