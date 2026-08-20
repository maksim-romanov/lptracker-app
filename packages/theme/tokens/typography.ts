import { tokenAlias } from "../kit/alias";

const fontFamily = {
  regular: { $value: "Satoshi-Regular" },
  medium: { $value: "Satoshi-Medium" },
  bold: { $value: "Satoshi-Bold" },
  black: { $value: "Satoshi-Black" },
  mono: { $value: "Menlo" },
};

const font = tokenAlias({ typography: { fontFamily } });

export default {
  typography: {
    fontFamily,
    lineHeight: {
      tight: { $value: 1.1 },
      normal: { $value: 1.4 },
      relaxed: { $value: 1.6 },
    },
    letterSpacing: {
      tight: { $value: -0.5 },
      normal: { $value: 0 },
      wide: { $value: 0.5 },
      wider: { $value: 1 },
    },
    role: {
      display: {
        fontFamily: font("typography.fontFamily.black"),
        fontSize: { $value: 32 },
        fontWeight: { $value: "700" },
        lineHeight: { $value: 38.4 },
        letterSpacing: { $value: 0 },
      },
      title: {
        fontFamily: font("typography.fontFamily.bold"),
        fontSize: { $value: 22 },
        fontWeight: { $value: "700" },
        lineHeight: { $value: 30.8 },
        letterSpacing: { $value: 0 },
      },
      headline: {
        fontFamily: font("typography.fontFamily.bold"),
        fontSize: { $value: 18 },
        fontWeight: { $value: "700" },
        lineHeight: { $value: 25.2 },
        letterSpacing: { $value: 0 },
      },
      body: {
        fontFamily: font("typography.fontFamily.regular"),
        fontSize: { $value: 16 },
        fontWeight: { $value: "400" },
        lineHeight: { $value: 25.6 },
        letterSpacing: { $value: 0 },
      },
      bodySmall: {
        fontFamily: font("typography.fontFamily.regular"),
        fontSize: { $value: 13 },
        fontWeight: { $value: "400" },
        lineHeight: { $value: 19.5 },
        letterSpacing: { $value: 0 },
      },
      label: {
        fontFamily: font("typography.fontFamily.medium"),
        fontSize: { $value: 14 },
        fontWeight: { $value: "500" },
        lineHeight: { $value: 19.6 },
        letterSpacing: { $value: 0.5 },
      },
      button: {
        fontFamily: font("typography.fontFamily.medium"),
        fontSize: { $value: 16 },
        fontWeight: { $value: "500" },
        lineHeight: { $value: 19.2 },
        letterSpacing: { $value: 0.5 },
      },
      input: {
        fontFamily: font("typography.fontFamily.medium"),
        fontSize: { $value: 16 },
        fontWeight: { $value: "500" },
        lineHeight: { $value: 19.2 },
        letterSpacing: { $value: 0 },
      },
    },
  },
};
