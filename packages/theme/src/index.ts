// Color tokens and palette
export { type ColorTokens, palette } from "./colors";
// Elevation (shadow scale)
export { type ElevationTokens, elevation, makeGlow } from "./elevation";
// Motion (durations, easing, springs)
export { type MotionTokens, motion } from "./motion";
// Network identity colors
export { type NetworkKey, type NetworkTokens, networks } from "./networks";
// P&L glyphs and helpers
export { directionOf, type PnLDirection, type PnLTokens, pnl } from "./pnl";
// Spacing & radius
export { type RadiusKey, type RadiusValue, radius, type SpacingKey, type SpacingValue, spacing } from "./spacing";
// Theme variants
export { neonDark, neonLight } from "./themes/neon";
// Typography
export { type FontWeight, fontFamily, letterSpacing, lineHeight, type TypographyTokens, typography } from "./typography";
// Z-index scale
export { type ZIndexTokens, zIndex } from "./z-index";

// All themes as a single object for convenience
export const themes = {
  neon: {
    light: () => import("./themes/neon").then((m) => m.neonLight),
    dark: () => import("./themes/neon").then((m) => m.neonDark),
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeMode = "light" | "dark";
