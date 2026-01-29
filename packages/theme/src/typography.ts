/**
 * Typography scale - Simplified responsive system
 *
 * 6 essential variants:
 * - display: Hero text, splash screens, empty states
 * - headline: Screen titles, section headers, card titles
 * - bodyLarge: Emphasized paragraphs, lead text
 * - body: Default for paragraphs, descriptions, list items
 * - bodySmall: Secondary info, timestamps, captions
 * - label: UI controls - buttons, tabs, chips, form labels
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
  display: TextStyleType;
  headline: TextStyleType;
  bodyLarge: TextStyleType;
  body: TextStyleType;
  bodySmall: TextStyleType;
  label: TextStyleType;
};

/**
 * Font families - Satoshi font family
 */
export const fontFamily = {
  regular: "Satoshi-Regular",
  medium: "Satoshi-Medium",
  semibold: "Satoshi-Bold",
  bold: "Satoshi-Bold",
  mono: "Menlo",
} as const;

/**
 * Line height multipliers
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
 * Typography scale - base sizes for phone (xs breakpoint)
 * Responsive scaling happens in Unistyles via breakpoints
 */
export const typography: TypographyTokens = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 39.6,
    letterSpacing: letterSpacing.normal,
  },
  headline: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    fontWeight: "600",
    lineHeight: 30.8,
    letterSpacing: letterSpacing.normal,
  },
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 25.6,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 22.4,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 19.2,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16.8,
    letterSpacing: letterSpacing.wide,
  },
};
