import type { Format, TransformedToken } from "style-dictionary/types";

import { getGroup, getTokenValue } from "./helpers";

const findFieldValue = (tokens: TransformedToken[], key: string, field: string): string | number | undefined => {
  const token = tokens.find((candidate) => candidate.path[2] === key && candidate.path[3] === field);
  return token ? getTokenValue(token) : undefined;
};

export const formatNetworks: Format["format"] = ({ dictionary }) => {
  const networks = getGroup(dictionary.allTokens, ["color", "networks"]);
  const keys = Array.from(new Set(networks.map((token) => token.path[2] as string)));

  const entries = keys.map((key) => {
    const base = findFieldValue(networks, key, "base");
    const onBase = findFieldValue(networks, key, "onBase");
    const soft = findFieldValue(networks, key, "soft");
    return `  ${key}: { base: "${base}", onBase: "${onBase}", soft: "${soft}" },`;
  });

  return [
    "// GENERATED FILE — do not edit. Source: packages/theme/tokens/color/networks.ts",
    "",
    `export type NetworkKey = ${keys.map((key) => `"${key}"`).join(" | ")};`,
    "",
    "export type NetworkColor = {",
    "  base: string;",
    "  onBase: string;",
    "  soft: string;",
    "};",
    "",
    "export const networkColors: Record<NetworkKey, NetworkColor> = {",
    ...entries,
    "};",
    "",
  ].join("\n");
};
