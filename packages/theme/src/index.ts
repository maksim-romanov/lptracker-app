// Color tokens and palette
export { type ColorTokens, palette } from "./colors";
// Network brand colors
export { type NetworkColor, type NetworkKey, networkColors } from "./networks";
// Spacing
export { type RadiusKey, type RadiusValue, radius, type SpacingKey, type SpacingValue, spacing } from "./spacing";
// Theme variants
export { depthlyDark, depthlyLight } from "./themes/depthly";
// Typography
export { type FontWeight, fontFamily, letterSpacing, lineHeight, type TypographyTokens, typography } from "./typography";

// All themes as a single object for convenience
export const themes = {
  depthly: {
    light: () => import("./themes/depthly").then((m) => m.depthlyLight),
    dark: () => import("./themes/depthly").then((m) => m.depthlyDark),
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeMode = "light" | "dark";
