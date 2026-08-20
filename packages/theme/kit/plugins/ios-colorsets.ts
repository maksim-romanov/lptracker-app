import type { TokensPlugin } from "../core";
import type { Resolved } from "../tree";
import { join } from "node:path";

export interface IosColorsetsOptions<T> {
  outDir: string;
  author: string;
  colorSpace?: "srgb" | "display-p3";
  entries(tree: Resolved<T>): Record<string, { light: string; dark: string }>;
}

const hexToComponents = (hex: string): { red: number; green: number; blue: number; alpha: number } => {
  const normalized = hex.replace("#", "");
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16) / 255,
    green: Number.parseInt(normalized.slice(2, 4), 16) / 255,
    blue: Number.parseInt(normalized.slice(4, 6), 16) / 255,
    alpha: 1,
  };
};

export function iosColorsets<T>(options: IosColorsetsOptions<T>): TokensPlugin<T> {
  const colorSpace = options.colorSpace ?? "srgb";
  return {
    name: "ios-colorsets",
    files: (tree) =>
      Object.entries(options.entries(tree)).map(([colorsetName, modes]) => ({
        path: join(options.outDir, `${colorsetName}.colorset`, "Contents.json"),
        contents: `${JSON.stringify(
          {
            colors: [
              { color: { "color-space": colorSpace, components: hexToComponents(modes.light) }, idiom: "universal" },
              {
                appearances: [{ appearance: "luminosity", value: "dark" }],
                color: { "color-space": colorSpace, components: hexToComponents(modes.dark) },
                idiom: "universal",
              },
            ],
            info: { version: 1, author: options.author },
          },
          null,
          2,
        )}\n`,
      })),
  };
}
