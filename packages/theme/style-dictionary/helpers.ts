import type { TransformedToken } from "style-dictionary/types";

export function getGroup(allTokens: TransformedToken[], prefix: string[]): TransformedToken[] {
  return allTokens.filter((token) => prefix.every((segment, index) => token.path[index] === segment));
}

// Token source files are authored in DTCG syntax ($value/$type), so Style Dictionary
// keeps the resolved value under `$value` rather than `value` — fall back accordingly.
export function getTokenValue(token: TransformedToken): string | number {
  return (token.value ?? token.$value) as string | number;
}

export function getValue(allTokens: TransformedToken[], path: string[]): string | number {
  const token = allTokens.find((candidate) => candidate.path.join(".") === path.join("."));
  if (!token) {
    throw new Error(`Missing design token: ${path.join(".")}`);
  }
  return getTokenValue(token);
}
