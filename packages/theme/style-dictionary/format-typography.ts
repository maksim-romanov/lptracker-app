import type { Format } from "style-dictionary/types";

import { getGroup, getTokenValue, getValue } from "./helpers";

const ROLES = ["display", "title", "headline", "body", "bodySmall", "label", "button", "input"] as const;
const FONT_FAMILY_KEYS = ["regular", "medium", "bold", "black", "mono"] as const;
const LINE_HEIGHT_KEYS = ["tight", "normal", "relaxed"] as const;
const LETTER_SPACING_KEYS = ["tight", "normal", "wide", "wider"] as const;

export const formatTypography: Format["format"] = ({ dictionary }) => {
  const fontWeights = Array.from(
    new Set(
      getGroup(dictionary.allTokens, ["typography", "role"])
        .filter((token) => token.path[3] === "fontWeight")
        .map((token) => getTokenValue(token) as string),
    ),
  ).sort();

  const fontFamilyLines = FONT_FAMILY_KEYS.map((key) => `  ${key}: "${getValue(dictionary.allTokens, ["typography", "fontFamily", key])}",`);
  const lineHeightLines = LINE_HEIGHT_KEYS.map((key) => `  ${key}: ${getValue(dictionary.allTokens, ["typography", "lineHeight", key])},`);
  const letterSpacingLines = LETTER_SPACING_KEYS.map(
    (key) => `  ${key}: ${getValue(dictionary.allTokens, ["typography", "letterSpacing", key])},`,
  );

  const roleLines = ROLES.map((role) =>
    [
      `  ${role}: {`,
      `    fontFamily: "${getValue(dictionary.allTokens, ["typography", "role", role, "fontFamily"])}",`,
      `    fontSize: ${getValue(dictionary.allTokens, ["typography", "role", role, "fontSize"])},`,
      `    fontWeight: "${getValue(dictionary.allTokens, ["typography", "role", role, "fontWeight"])}",`,
      `    lineHeight: ${getValue(dictionary.allTokens, ["typography", "role", role, "lineHeight"])},`,
      `    letterSpacing: ${getValue(dictionary.allTokens, ["typography", "role", role, "letterSpacing"])},`,
      "  },",
    ].join("\n"),
  );

  return [
    "// GENERATED FILE — do not edit. Source: packages/theme/tokens/typography.ts",
    "",
    `export type FontWeight = ${fontWeights.map((weight) => `"${weight}"`).join(" | ")};`,
    "",
    "export type TextStyleType = {",
    "  fontFamily: string;",
    "  fontSize: number;",
    "  fontWeight: FontWeight;",
    "  lineHeight: number;",
    "  letterSpacing: number;",
    "};",
    "",
    "export type TypographyTokens = {",
    ...ROLES.map((role) => `  ${role}: TextStyleType;`),
    "};",
    "",
    "export const fontFamily = {",
    ...fontFamilyLines,
    "} as const;",
    "",
    "export const lineHeight = {",
    ...lineHeightLines,
    "} as const;",
    "",
    "export const letterSpacing = {",
    ...letterSpacingLines,
    "} as const;",
    "",
    "export const typography: TypographyTokens = {",
    ...roleLines,
    "};",
    "",
  ].join("\n");
};
