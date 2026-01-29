// Color tokens and palette
export { type ColorTokens, palette } from "./colors";
// Spacing
export { type RadiusKey, type RadiusValue, radius, type SpacingKey, type SpacingValue, spacing } from "./spacing";
// Theme variants
export { neonDark, neonLight } from "./themes/neon";
// Typography
export { type FontWeight, fontFamily, letterSpacing, lineHeight, type TypographyTokens, typography } from "./typography";

// All themes as a single object for convenience
export const themes = {
  neon: {
    light: () => import("./themes/neon").then((m) => m.neonLight),
    dark: () => import("./themes/neon").then((m) => m.neonDark),
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeMode = "light" | "dark";
