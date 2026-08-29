import { tokenAlias } from "../kit/alias";

// React Native resolves a face by its PostScript name, which for IBM Plex abbreviates the
// style token — `-Medm`, not `-Medium`; `-SmBld`, not `-SemiBold`. Getting these wrong makes
// the platform fall back to the system font silently. Verified with `fc-scan` against the
// shipped files in apps/mobile/assets/fonts.
const fontFamily = {
  sans: { $value: "IBMPlexSans" },
  sansMedium: { $value: "IBMPlexSans-Medm" },
  sansSemiBold: { $value: "IBMPlexSans-SmBld" },
  sansBold: { $value: "IBMPlexSans-Bold" },
  mono: { $value: "IBMPlexMono" },
  monoMedium: { $value: "IBMPlexMono-Medm" },
  monoSemiBold: { $value: "IBMPlexMono-SmBld" },
};

// The web selects a family and lets the weight pick the face, so it needs the human family
// name plus a fallback chain — a different shape from the PostScript names above.
const fontStack = {
  sans: { $value: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif' },
  mono: { $value: '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace' },
};

const font = tokenAlias({ typography: { fontFamily } });

export default {
  typography: {
    fontFamily,
    fontStack,
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
    // Two families, split by what the text *is*: words are set in the sans, figures and
    // hashes in the mono. Mono never carries prose — that is the rule that keeps this from
    // reading as terminal pastiche.
    role: {
      // --- figures (mono) ---
      display: {
        fontFamily: font("typography.fontFamily.monoMedium"),
        fontSize: { $value: 34 },
        fontWeight: { $value: "500" },
        lineHeight: { $value: 40 },
        letterSpacing: { $value: -0.6 },
      },
      figure: {
        fontFamily: font("typography.fontFamily.mono"),
        fontSize: { $value: 15 },
        fontWeight: { $value: "400" },
        lineHeight: { $value: 21 },
        letterSpacing: { $value: -0.2 },
      },
      figureSmall: {
        fontFamily: font("typography.fontFamily.mono"),
        fontSize: { $value: 13 },
        fontWeight: { $value: "400" },
        lineHeight: { $value: 19 },
        letterSpacing: { $value: -0.2 },
      },

      // --- words (sans) ---
      title: {
        fontFamily: font("typography.fontFamily.sansSemiBold"),
        fontSize: { $value: 22 },
        fontWeight: { $value: "600" },
        lineHeight: { $value: 28 },
        letterSpacing: { $value: -0.3 },
      },
      headline: {
        fontFamily: font("typography.fontFamily.sansSemiBold"),
        fontSize: { $value: 17 },
        fontWeight: { $value: "600" },
        lineHeight: { $value: 23 },
        letterSpacing: { $value: -0.1 },
      },
      body: {
        fontFamily: font("typography.fontFamily.sans"),
        fontSize: { $value: 15 },
        fontWeight: { $value: "400" },
        lineHeight: { $value: 21 },
        letterSpacing: { $value: 0 },
      },
      bodySmall: {
        fontFamily: font("typography.fontFamily.sans"),
        fontSize: { $value: 13 },
        fontWeight: { $value: "400" },
        lineHeight: { $value: 19 },
        letterSpacing: { $value: 0 },
      },
      label: {
        fontFamily: font("typography.fontFamily.sansMedium"),
        fontSize: { $value: 12 },
        fontWeight: { $value: "500" },
        lineHeight: { $value: 16 },
        letterSpacing: { $value: 0.5 },
      },
      caption: {
        fontFamily: font("typography.fontFamily.sans"),
        fontSize: { $value: 11 },
        fontWeight: { $value: "400" },
        lineHeight: { $value: 14 },
        letterSpacing: { $value: 0 },
      },
      button: {
        fontFamily: font("typography.fontFamily.sansMedium"),
        fontSize: { $value: 16 },
        fontWeight: { $value: "500" },
        lineHeight: { $value: 20 },
        letterSpacing: { $value: 0.5 },
      },
      input: {
        fontFamily: font("typography.fontFamily.sansMedium"),
        fontSize: { $value: 16 },
        fontWeight: { $value: "500" },
        lineHeight: { $value: 20 },
        letterSpacing: { $value: 0 },
      },
    },
  },
};
