import type { StacksBreakpoints as _StacksBreakpoints } from "@grapp/stacks";
import {
  type ColorTokens,
  elevation,
  motion,
  neonDark,
  neonLight,
  networks,
  pnl,
  radius,
  spacing,
  typography,
  zIndex,
} from "@mars-909/theme";
import { StyleSheet } from "react-native-unistyles";

/**
 * Stacks layout configuration
 */
const stacks = {
  spacing: 4, // Base unit matching @mars-909/theme (4px)
  debug: false,
};

/**
 * Complete theme type combining colors with all design-system tokens.
 */
export type AppTheme = ColorTokens & {
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  stacks: typeof stacks;
  elevation: typeof elevation;
  motion: typeof motion;
  networks: typeof networks;
  pnl: typeof pnl;
  zIndex: typeof zIndex;
};

/**
 * Create a complete theme from color tokens
 */
const createTheme = (colors: ColorTokens): AppTheme => ({
  ...colors,
  spacing,
  radius,
  typography,
  stacks,
  elevation,
  motion,
  networks,
  pnl,
  zIndex,
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

declare module "@grapp/stacks" {
  export interface StacksBreakpoints extends AppBreakpoints {}
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
