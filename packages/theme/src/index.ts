// Color tokens and palette
export { type ColorTokens, palette } from "./colors";
// Spacing
export { type RadiusKey, type RadiusValue, radius, type SpacingKey, type SpacingValue, spacing } from "./spacing";
export { midnightDark, midnightLight } from "./themes/midnight";
export { mintDark, mintLight } from "./themes/mint";
export { nebulaDark, nebulaLight } from "./themes/nebula";
// Theme variants
export { oceanDark, oceanLight } from "./themes/ocean";
export { sunsetDark, sunsetLight } from "./themes/sunset";
// Typography
export { type FontWeight, fontFamily, fontSize, letterSpacing, lineHeight, type TypographyTokens, typography } from "./typography";

// All themes as a single object for convenience
export const themes = {
  ocean: { light: () => import("./themes/ocean").then((m) => m.oceanLight), dark: () => import("./themes/ocean").then((m) => m.oceanDark) },
  nebula: {
    light: () => import("./themes/nebula").then((m) => m.nebulaLight),
    dark: () => import("./themes/nebula").then((m) => m.nebulaDark),
  },
  mint: { light: () => import("./themes/mint").then((m) => m.mintLight), dark: () => import("./themes/mint").then((m) => m.mintDark) },
  sunset: {
    light: () => import("./themes/sunset").then((m) => m.sunsetLight),
    dark: () => import("./themes/sunset").then((m) => m.sunsetDark),
  },
  midnight: {
    light: () => import("./themes/midnight").then((m) => m.midnightLight),
    dark: () => import("./themes/midnight").then((m) => m.midnightDark),
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeMode = "light" | "dark";
