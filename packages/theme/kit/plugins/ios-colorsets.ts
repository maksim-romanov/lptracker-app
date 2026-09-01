import type { TokensPlugin } from "../core";
import type { Resolved } from "../tree";
import { join } from "node:path";

export interface IosColorsetsOptions<T> {
  outDir: string;
  author: string;
  colorSpace?: "srgb" | "display-p3";
  entries(tree: Resolved<T>): Record<string, { light: string; dark: string }>;
}

// #RRGGBB or #RRGGBBAA. Anything else is a typo in the token tree rather than a colour
// this plugin should guess at, and a silent NaN would reach Xcode as an unreadable asset.
const hexToComponents = (hex: string): { red: number; green: number; blue: number; alpha: number } => {
  const normalized = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(normalized)) {
    throw new Error(`iosColorsets: "${hex}" is not a #RRGGBB or #RRGGBBAA colour`);
  }
  const channel = (offset: number) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255;
  return {
    red: channel(0),
    green: channel(2),
    blue: channel(4),
    alpha: normalized.length === 8 ? channel(6) : 1,
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
