import type { WebTarget } from "../../fonts/manifest";
import { faces, fallbackFamily, fallbackOverrides, families } from "../../fonts/manifest";
import type { TokensPlugin } from "../core";

export interface FontFaceCssOptions {
  targets: WebTarget[];
}

const rule = (declarations: Record<string, string>): string =>
  ["@font-face {", ...Object.entries(declarations).map(([property, value]) => `  ${property}: ${value};`), "}"].join("\n");

/**
 * Emits one stylesheet per web surface: the real faces split by `unicode-range`, plus a local
 * face re-declared with metric overrides so the swap from fallback to webfont shifts nothing.
 *
 * Generated rather than hand-written because the count gets away from you quickly — seven faces
 * across six subsets is forty-two rules, each with a URL only this target knows.
 */
export function fontFaceCss<T>(options: FontFaceCssOptions): TokensPlugin<T> {
  return {
    name: "font-face-css",
    files: () =>
      options.targets.map((target) => {
        const usedFamilies = [...new Set(target.faces.map((faceName) => faces[faceName].family))];

        const realFaces = target.faces.flatMap((faceName) => {
          const face = faces[faceName];
          const family = families[face.family];
          return family.subsets.map((subset) =>
            [
              `/* ${family.cssFamily} ${face.weight} — ${subset.name} */`,
              rule({
                "font-family": `"${family.cssFamily}"`,
                "font-style": "normal",
                "font-weight": String(face.weight),
                "font-display": "swap",
                src: `url("${target.urlPrefix}/${face.file}-${subset.name}.woff2") format("woff2")`,
                "unicode-range": subset.unicodeRange,
              }),
            ].join("\n"),
          );
        });

        const fallbacks = usedFamilies.map((familyName) => {
          const family = families[familyName];
          return [
            `/* Metric-matched stand-in for ${family.cssFamily}, so nothing reflows on swap */`,
            rule({
              "font-family": `"${fallbackFamily(family)}"`,
              src: `local("${family.fallback.local}")`,
              ...fallbackOverrides(family),
            }),
          ].join("\n");
        });

        return {
          path: target.cssOutFile,
          contents: [
            "/* GENERATED FILE — do not edit. Source: packages/theme/fonts/manifest.ts */",
            "",
            ...fallbacks,
            "",
            ...realFaces,
            "",
          ].join("\n"),
        };
      }),
  };
}
