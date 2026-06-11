import { type ColorTokens, depthlyDark, depthlyLight, radius, spacing, typography } from "@depthly/theme";
import { StyleSheet } from "react-native-unistyles";

const stacks = {
  spacing: 4,
  debug: false,
};

export type AppTheme = ColorTokens & {
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  stacks: typeof stacks;
};

const createTheme = (colors: ColorTokens): AppTheme => ({
  ...colors,
  spacing,
  radius,
  typography,
  stacks,
});

export const themes = {
  depthlyLight: createTheme(depthlyLight),
  depthlyDark: createTheme(depthlyDark),
} as const;

export type ThemeName = keyof typeof themes;

const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

type AppBreakpoints = typeof breakpoints;
type AppThemes = typeof themes;

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

declare module "@grapp/stacks" {
  export interface StacksBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes,
  breakpoints,
  settings: {
    initialTheme: "depthlyDark",
  },
});

export { StyleSheet };
