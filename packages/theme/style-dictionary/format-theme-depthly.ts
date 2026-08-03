import type { Format, TransformedToken } from "style-dictionary/types";

import { getGroup, getTokenValue } from "./helpers";

const emitTheme = (name: string, tokens: TransformedToken[]): string =>
  [`export const ${name}: ColorTokens = {`, ...tokens.map((token) => `  ${token.path[3]}: "${getTokenValue(token)}",`), "};"].join("\n");

export const formatThemeDepthly: Format["format"] = ({ dictionary }) => {
  const dark = getGroup(dictionary.allTokens, ["color", "depthly", "dark"]);
  const light = getGroup(dictionary.allTokens, ["color", "depthly", "light"]);
  return [
    "// GENERATED FILE — do not edit. Source: packages/theme/tokens/color/depthly.ts",
    "",
    'import type { ColorTokens } from "../colors";',
    "",
    emitTheme("depthlyDark", dark),
    "",
    emitTheme("depthlyLight", light),
    "",
  ].join("\n");
};
