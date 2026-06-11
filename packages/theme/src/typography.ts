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
  title: TextStyleType;
  headline: TextStyleType;
  body: TextStyleType;
  bodySmall: TextStyleType;
  label: TextStyleType;
  button: TextStyleType;
  input: TextStyleType;
};

export const fontFamily = {
  regular: "Satoshi-Regular",
  medium: "Satoshi-Medium",
  bold: "Satoshi-Bold",
  black: "Satoshi-Black",
  mono: "Menlo",
} as const;

export const lineHeight = {
  tight: 1.1,
  normal: 1.4,
  relaxed: 1.6,
} as const;

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

// Base sizes for the xs breakpoint. Responsive scaling happens in Unistyles via breakpoints.
export const typography: TypographyTokens = {
  display: {
    fontFamily: fontFamily.black,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 38.4,
    letterSpacing: letterSpacing.normal,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30.8,
    letterSpacing: letterSpacing.normal,
  },
  headline: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25.2,
    letterSpacing: letterSpacing.normal,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 25.6,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 19.5,
    letterSpacing: letterSpacing.normal,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 19.6,
    letterSpacing: letterSpacing.wide,
  },
  button: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 19.2,
    letterSpacing: letterSpacing.wide,
  },
  input: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 19.2,
    letterSpacing: letterSpacing.normal,
  },
};
