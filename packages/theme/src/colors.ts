/**
 * Color tokens following Material Design 3 naming conventions
 * These are semantic color roles, not raw color values
 */

export type ColorTokens = {
  // Primary colors
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;

  // Secondary colors
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;

  // Surface colors
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceDim: string;
  surfaceBright: string;

  // Background
  background: string;
  onBackground: string;

  // Outline
  outline: string;
  outlineVariant: string;

  // Error
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  // Success
  success: string;
  onSuccess: string;

  // Warning
  warning: string;
  onWarning: string;

  // Inverse
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;

  // Scrim & Shadow
  scrim: string;
  shadow: string;
};

/**
 * Base color palette - raw color values
 */
export const palette = {
  // Blues
  blue50: "#E3F2FD",
  blue100: "#BBDEFB",
  blue200: "#90CAF9",
  blue300: "#64B5F6",
  blue400: "#42A5F5",
  blue500: "#2196F3",
  blue600: "#1E88E5",
  blue700: "#1976D2",
  blue800: "#1565C0",
  blue900: "#0D47A1",

  // Purples
  purple50: "#F3E5F5",
  purple100: "#E1BEE7",
  purple200: "#CE93D8",
  purple300: "#BA68C8",
  purple400: "#AB47BC",
  purple500: "#9C27B0",
  purple600: "#8E24AA",
  purple700: "#7B1FA2",
  purple800: "#6A1B9A",
  purple900: "#4A148C",

  // Teals
  teal50: "#E0F2F1",
  teal100: "#B2DFDB",
  teal200: "#80CBC4",
  teal300: "#4DB6AC",
  teal400: "#26A69A",
  teal500: "#009688",
  teal600: "#00897B",
  teal700: "#00796B",
  teal800: "#00695C",
  teal900: "#004D40",

  // Oranges
  orange50: "#FFF3E0",
  orange100: "#FFE0B2",
  orange200: "#FFCC80",
  orange300: "#FFB74D",
  orange400: "#FFA726",
  orange500: "#FF9800",
  orange600: "#FB8C00",
  orange700: "#F57C00",
  orange800: "#EF6C00",
  orange900: "#E65100",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",

  neutral50: "#FAFAFA",
  neutral100: "#F5F5F5",
  neutral200: "#EEEEEE",
  neutral300: "#E0E0E0",
  neutral400: "#BDBDBD",
  neutral500: "#9E9E9E",
  neutral600: "#757575",
  neutral700: "#616161",
  neutral800: "#424242",
  neutral900: "#212121",
  neutral950: "#121212",

  // Semantic
  red50: "#FFEBEE",
  red100: "#FFCDD2",
  red500: "#F44336",
  red700: "#D32F2F",
  red900: "#B71C1C",

  green50: "#E8F5E9",
  green100: "#C8E6C9",
  green500: "#4CAF50",
  green700: "#388E3C",
  green900: "#1B5E20",

  amber50: "#FFF8E1",
  amber100: "#FFECB3",
  amber500: "#FFC107",
  amber700: "#FFA000",
  amber900: "#FF6F00",
} as const;
