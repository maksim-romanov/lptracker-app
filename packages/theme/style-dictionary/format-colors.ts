import type { Format } from "style-dictionary/types";

import { getGroup, getTokenValue, getValue } from "./helpers";

const PALETTE_RAMPS = ["blue", "purple", "neonPink", "teal", "orange", "neutral", "red", "green", "amber"];
const PALETTE_SINGLES = ["neonCyan", "neonPurple", "neonYellow", "white", "black"];

export const formatColors: Format["format"] = ({ dictionary }) => {
  const colorFields = getGroup(dictionary.allTokens, ["color", "depthly", "dark"]).map((token) => token.path[3] as string);

  const lines: string[] = [];
  for (const ramp of PALETTE_RAMPS) {
    const shades = getGroup(dictionary.allTokens, ["color", "palette", ramp]).sort((a, b) => Number(a.path[3]) - Number(b.path[3]));
    lines.push(`  ${ramp}: {`);
    for (const shade of shades) {
      lines.push(`    ${JSON.stringify(shade.path[3])}: "${getTokenValue(shade)}",`);
    }
    lines.push("  },");
  }
  for (const single of PALETTE_SINGLES) {
    lines.push(`  ${single}: "${getValue(dictionary.allTokens, ["color", "palette", single])}",`);
  }

  return [
    "// GENERATED FILE — do not edit. Source: packages/theme/tokens/color/palette.ts, depthly.ts",
    "",
    "export type ColorTokens = {",
    ...colorFields.map((field) => `  ${field}: string;`),
    "};",
    "",
    "export const palette = {",
    ...lines,
    "} as const;",
    "",
  ].join("\n");
};
