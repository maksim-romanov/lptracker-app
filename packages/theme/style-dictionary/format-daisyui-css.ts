import type { Format, TransformedToken } from "style-dictionary/types";

import { getValue } from "./helpers";

const COLOR_MAP: Array<[cssVar: string, sourceField: string]> = [
  ["--color-base-100", "surface"],
  ["--color-base-200", "surfaceContainer"],
  ["--color-base-300", "surfaceVariant"],
  ["--color-base-content", "onSurface"],
  ["--color-primary", "primary"],
  ["--color-primary-content", "onPrimary"],
  ["--color-secondary", "secondary"],
  ["--color-secondary-content", "onSecondary"],
  ["--color-accent", "secondary"],
  ["--color-accent-content", "onSecondary"],
  ["--color-neutral", "surfaceVariant"],
  ["--color-neutral-content", "onSurfaceVariant"],
  ["--color-info", "secondary"],
  ["--color-info-content", "onSecondary"],
  ["--color-success", "success"],
  ["--color-success-content", "onSuccess"],
  ["--color-warning", "warning"],
  ["--color-warning-content", "onWarning"],
  ["--color-error", "error"],
  ["--color-error-content", "onError"],
];

// SSR-local structural constants — not sourced from @depthly/theme yet (same in both
// modes today). Pending the future re-skin phase — see apps/server/design-system/depthly-app/MASTER.md.
const STRUCTURAL_LINES = [
  "  --radius-selector: 0.75rem;",
  "  --radius-field: 2rem;",
  "  --radius-box: 1.5rem;",
  "  --size-selector: 0.28125rem;",
  "  --size-field: 0.28125rem;",
  "  --border: 1px;",
  "  --depth: 1;",
  "  --noise: 0;",
];

const emitBlock = (name: string, mode: "light" | "dark", allTokens: TransformedToken[]): string => {
  const colorLines = COLOR_MAP.map(([cssVar, field]) => `  ${cssVar}: ${getValue(allTokens, ["color", "depthly", mode, field])};`);
  return [
    '@plugin "daisyui/theme" {',
    `  name: "${name}";`,
    `  default: ${mode === "light"};`,
    `  prefersdark: ${mode === "dark"};`,
    `  color-scheme: ${mode};`,
    "",
    ...colorLines,
    "",
    ...STRUCTURAL_LINES,
    "}",
  ].join("\n");
};

export const formatDaisyuiCss: Format["format"] = ({ dictionary }) => {
  return [
    "/* GENERATED FILE — do not edit. Source: packages/theme/tokens/color/depthly.ts */",
    "/* radius/depth/border/noise below are SSR-local constants, not yet from @depthly/theme */",
    "",
    emitBlock("depthly-light", "light", dictionary.allTokens),
    "",
    emitBlock("depthly-dark", "dark", dictionary.allTokens),
    "",
  ].join("\n");
};
