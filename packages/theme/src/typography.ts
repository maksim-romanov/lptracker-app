/**
 * Typography scale following Material Design 3 type scale
 * Inspired by Flighty, Uniswap, Stargate apps
 */

export type FontWeight = "400" | "500" | "600" | "700";

export type TextStyleType = {
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  lineHeight: number;
  letterSpacing: number;
};

export type TypographyTokens = {
  // Display - Large titles, hero text
  displayLarge: TextStyleType;
  displayMedium: TextStyleType;
  displaySmall: TextStyleType;

  // Headline - Section headers
  headlineLarge: TextStyleType;
  headlineMedium: TextStyleType;
  headlineSmall: TextStyleType;

  // Title - Card titles, list headers
  titleLarge: TextStyleType;
  titleMedium: TextStyleType;
  titleSmall: TextStyleType;

  // Body - Main content text
  bodyLarge: TextStyleType;
  bodyMedium: TextStyleType;
  bodySmall: TextStyleType;

  // Label - Buttons, chips, tabs
  labelLarge: TextStyleType;
  labelMedium: TextStyleType;
  labelSmall: TextStyleType;
};

/**
 * Font families
 * Using system fonts for optimal rendering
 */
export const fontFamily = {
  regular: "System",
  medium: "System",
  semibold: "System",
  bold: "System",
  mono: "Menlo",
} as const;

/**
 * Font sizes in pixels
 */
export const fontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 22,
  "3xl": 28,
  "4xl": 36,
  "5xl": 45,
  "6xl": 57,
} as const;

/**
 * Line heights (multiplier)
 */
export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

/**
 * Letter spacing
 */
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

/**
 * Typography scale
 */
export const typography: TypographyTokens = {
  // Display
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize["6xl"],
    fontWeight: "700",
    lineHeight: fontSize["6xl"] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  displayMedium: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize["5xl"],
    fontWeight: "700",
    lineHeight: fontSize["5xl"] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  displaySmall: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize["4xl"],
    fontWeight: "700",
    lineHeight: fontSize["4xl"] * lineHeight.tight,
    letterSpacing: letterSpacing.normal,
  },

  // Headline
  headlineLarge: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize["3xl"],
    fontWeight: "600",
    lineHeight: fontSize["3xl"] * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  headlineMedium: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize["2xl"],
    fontWeight: "600",
    lineHeight: fontSize["2xl"] * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  headlineSmall: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    fontWeight: "600",
    lineHeight: fontSize.xl * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Title
  titleLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xl,
    fontWeight: "500",
    lineHeight: fontSize.xl * lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
  titleMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    fontWeight: "500",
    lineHeight: fontSize.lg * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  titleSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: "500",
    lineHeight: fontSize.md * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },

  // Body
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.lg,
    fontWeight: "400",
    lineHeight: fontSize.lg * lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    fontWeight: "400",
    lineHeight: fontSize.md * lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    fontWeight: "400",
    lineHeight: fontSize.sm * lineHeight.relaxed,
    letterSpacing: letterSpacing.normal,
  },

  // Label
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    fontWeight: "500",
    lineHeight: fontSize.md * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    fontWeight: "500",
    lineHeight: fontSize.sm * lineHeight.normal,
    letterSpacing: letterSpacing.wider,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    fontWeight: "500",
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: letterSpacing.wider,
  },
};
