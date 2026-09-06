import { cssVariablesTheme } from "../plugins/css-variables";
import { describe, expect, test } from "bun:test";

describe("cssVariablesTheme plugin", () => {
  test("renders one CSS rule per block, in declared order", () => {
    const plugin = cssVariablesTheme<{ x: number }>({
      outFile: "dist/out.css",
      headerComments: ["/* header */"],
      blocks: () => [
        { selector: ":root", declarations: { "--color-surface": "#FFFFFF" } },
        { selector: '[data-theme="depthly-dark"]', declarations: { "--color-surface": "#000000" } },
      ],
    });

    const [file] = plugin.files({} as never);

    expect(file.path).toBe("dist/out.css");
    expect(file.contents).toContain("/* header */");
    expect(file.contents).toContain(":root {\n  --color-surface: #FFFFFF;\n}");
    expect(file.contents).toContain('[data-theme="depthly-dark"] {\n  --color-surface: #000000;\n}');
  });

  test("wraps a block in @media when `media` is set", () => {
    const plugin = cssVariablesTheme<{ x: number }>({
      outFile: "dist/out.css",
      headerComments: [],
      blocks: () => [{ selector: ":root", declarations: { "--color-surface": "#000000" }, media: "(prefers-color-scheme: dark)" }],
    });

    const [file] = plugin.files({} as never);

    expect(file.contents).toContain("@media (prefers-color-scheme: dark) {\n  :root {\n    --color-surface: #000000;\n  }\n}");
  });
});
