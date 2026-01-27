import { type ColorTokens, neonDark, neonLight, radius, spacing, typography } from "@matrapp/theme";
import { StyleSheet } from "react-native-unistyles";

/**
 * Complete theme type combining colors, spacing, and typography
 */
export type AppTheme = ColorTokens & {
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

/**
 * Create a complete theme from color tokens
 */
const createTheme = (colors: ColorTokens): AppTheme => ({
  ...colors,
  spacing,
  radius,
  typography,
});

/**
 * All available themes
 */
export const themes = {
  neonLight: createTheme(neonLight),
  neonDark: createTheme(neonDark),
} as const;

export type ThemeName = keyof typeof themes;

/**
 * Breakpoints for responsive design
 */
const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

// Type augmentation for Unistyles
type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof themes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

/**
 * Configure Unistyles
 */
StyleSheet.configure({
  themes,
  breakpoints,
  settings: {
    initialTheme: "neonDark",
  },
});

export { StyleSheet };
