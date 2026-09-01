import { iosColorsets } from "../plugins/ios-colorsets";
import { describe, expect, test } from "bun:test";

const build = (entries: Record<string, { light: string; dark: string }>) =>
  iosColorsets<{ x: number }>({ outDir: "out", author: "test", entries: () => entries }).files({} as never);

const componentsOf = (contents: string | Uint8Array, index: number) => JSON.parse(String(contents)).colors[index].color.components;

describe("iosColorsets plugin", () => {
  test("reads #RRGGBB as fully opaque", () => {
    const [file] = build({ brand: { light: "#8B4DFF", dark: "#FFFFFF" } });

    expect(componentsOf(file.contents, 0)).toEqual({ red: 139 / 255, green: 77 / 255, blue: 255 / 255, alpha: 1 });
    expect(componentsOf(file.contents, 1).alpha).toBe(1);
  });

  test("reads the alpha channel of #RRGGBBAA", () => {
    const [file] = build({ muted: { light: "#12101680", dark: "#FFFFFFA3" } });

    expect(componentsOf(file.contents, 0).alpha).toBeCloseTo(128 / 255, 10);
    expect(componentsOf(file.contents, 1).alpha).toBeCloseTo(163 / 255, 10);
    expect(componentsOf(file.contents, 1).red).toBe(1);
  });

  test("throws on a value that is not a hex colour", () => {
    expect(() => build({ broken: { light: "rgba(255,255,255,0.64)", dark: "#000000" } })).toThrow(
      'iosColorsets: "rgba(255,255,255,0.64)" is not a #RRGGBB or #RRGGBBAA colour',
    );
  });
});
