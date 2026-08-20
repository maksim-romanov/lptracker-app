// Color tokens and palette
export { type ColorTokens, palette } from "../dist/js/colors";
// Network brand colors
export { type NetworkColor, type NetworkKey, networkColors } from "../dist/js/networks";
// Spacing
export { type RadiusKey, type RadiusValue, radius, type SpacingKey, type SpacingValue, spacing } from "../dist/js/spacing";
// Theme variants
export { depthlyDark, depthlyLight } from "../dist/js/themes/depthly";
// Typography
export { type FontWeight, fontFamily, letterSpacing, lineHeight, type TypographyTokens, typography } from "../dist/js/typography";

// All themes as a single object for convenience
export const themes = {
  depthly: {
    light: () => import("../dist/js/themes/depthly").then((m) => m.depthlyLight),
    dark: () => import("../dist/js/themes/depthly").then((m) => m.depthlyDark),
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeMode = "light" | "dark";
