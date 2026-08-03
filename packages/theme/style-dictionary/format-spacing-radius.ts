import type { Format, TransformedToken } from "style-dictionary/types";

import { getGroup, getTokenValue } from "./helpers";

const IDENTIFIER_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const formatKey = (key: string): string => (IDENTIFIER_KEY.test(key) ? key : JSON.stringify(key));

const emitScale = (constName: string, keyTypeName: string, valueTypeName: string, tokens: TransformedToken[]): string[] => [
  `export const ${constName} = {`,
  ...tokens.map((token) => `  ${formatKey(token.path[1] as string)}: ${getTokenValue(token)},`),
  "} as const;",
  "",
  `export type ${keyTypeName} = keyof typeof ${constName};`,
  `export type ${valueTypeName} = (typeof ${constName})[${keyTypeName}];`,
];

export const formatSpacingRadius: Format["format"] = ({ dictionary }) => {
  const spacing = getGroup(dictionary.allTokens, ["spacing"]);
  const radius = getGroup(dictionary.allTokens, ["radius"]);
  return [
    "// GENERATED FILE — do not edit. Source: packages/theme/tokens/spacing.ts",
    "",
    ...emitScale("spacing", "SpacingKey", "SpacingValue", spacing),
    "",
    ...emitScale("radius", "RadiusKey", "RadiusValue", radius),
    "",
  ].join("\n");
};
