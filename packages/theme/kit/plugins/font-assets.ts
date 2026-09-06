import { type FontTarget, faces, families } from "../../fonts/manifest";
import type { GeneratedFile, TokensPlugin } from "../core";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface FontAssetsOptions {
  /** Root of the canonical font store, relative to packages/theme. */
  sourceDir: string;
  /** Filename inside sourceDir. The OFL requires it to travel with the files it covers. */
  licenseFile: string;
  targets: FontTarget[];
}

/**
 * Hands each surface the faces it actually sets: whole `.ttf` files for the native targets,
 * and per-subset `.woff2` for the web, where a subset is fetched only if a character in its
 * range gets rendered.
 */
export function fontAssets<T>(options: FontAssetsOptions): TokensPlugin<T> {
  const copy = (from: string, to: string): GeneratedFile => ({ path: to, contents: readFileSync(from) });

  return {
    name: "font-assets",
    cleanDirs: () => options.targets.map((target) => resolve(target.outDir)),
    files: () =>
      options.targets.flatMap((target) => [
        copy(resolve(options.sourceDir, options.licenseFile), resolve(target.outDir, options.licenseFile)),
        ...target.faces.flatMap((faceName) => {
          const face = faces[faceName];
          const family = families[face.family];
          const familyDir = resolve(options.sourceDir, family.dir);

          if (target.kind === "native") {
            const name = target.fileName ? target.fileName(face) : face.file;
            return [copy(resolve(familyDir, "ttf", `${face.file}.ttf`), resolve(target.outDir, `${name}.ttf`))];
          }

          return family.subsets.map((subset) =>
            copy(resolve(familyDir, "woff2", `${face.file}-${subset.name}.woff2`), resolve(target.outDir, `${face.file}-${subset.name}.woff2`)),
          );
        }),
      ]),
  };
}
