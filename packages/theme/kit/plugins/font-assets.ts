import type { FontTarget } from "../../fonts/manifest";
import { faces, families } from "../../fonts/manifest";
import type { TokensPlugin } from "../core";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface FontAssetsOptions {
  /** Root of the canonical font store, relative to packages/theme. */
  sourceDir: string;
  targets: FontTarget[];
}

/**
 * Copies each target the subset of faces it actually sets. Destinations are gitignored —
 * `packages/theme/fonts` holds the only checked-in copies.
 */
export function fontAssets<T>(options: FontAssetsOptions): TokensPlugin<T> {
  return {
    name: "font-assets",
    files: () =>
      options.targets.flatMap((target) =>
        target.faces.map((faceName) => {
          const face = faces[faceName];
          const from = resolve(options.sourceDir, families[face.family].dir, `${face.file}.${target.format}`);
          const to = target.fileName ? target.fileName(face) : face.file;
          return { path: resolve(target.outDir, `${to}.${target.format}`), contents: readFileSync(from) };
        }),
      ),
  };
}
