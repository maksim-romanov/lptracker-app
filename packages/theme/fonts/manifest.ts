// The font files in this folder are the only copies checked in. Every surface that needs them
// gets its own subset written by `bun run codegen` (kit/plugins/font-assets.ts), and the web
// surfaces also get a generated @font-face sheet (kit/plugins/font-face-css.ts). Adding a family
// means dropping its files in a folder here and adding entries below — never copying binaries
// into app directories by hand.
//
// Layout per family: <dir>/ttf/<Face>.ttf for the native targets, which need whole files, and
// <dir>/woff2/<Face>-<Subset>.woff2 for the web, which pulls a subset only when a character in
// its range is actually rendered.

/** Head/OS2 values, in font units. Source: @capsizecss/metrics. */
export interface FontMetrics {
  unitsPerEm: number;
  ascent: number;
  /** Negative, as the font stores it. */
  descent: number;
  lineGap: number;
  /** Average advance width; what size-adjust is computed from. */
  xWidthAvg: number;
}

export interface FontSubset {
  /** Suffix on the split filename, e.g. `Latin1`. */
  name: string;
  /** Verbatim from IBM's own split stylesheet — these are not ours to invent. */
  unicodeRange: string;
}

export interface FontFamily {
  /** Folder under packages/theme/fonts holding this family's files. */
  dir: string;
  /** Family name as the web resolves it, and as it appears in @font-face. */
  cssFamily: string;
  /** Generic families appended after the webfont and its adjusted fallback. */
  fallbacks: string;
  metrics: FontMetrics;
  /**
   * A locally installed face, re-declared with metric overrides so text does not reflow when
   * the webfont swaps in. Picked for metric proximity, not for looks: the point is that it
   * occupies the same space.
   */
  fallback: { local: string; metrics: FontMetrics };
  subsets: FontSubset[];
}

const SANS_SUBSETS: FontSubset[] = [
  {
    name: "Latin1",
    unicodeRange:
      "U+0000, U+000D, U+0020-007E, U+00A0-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2013-2014, U+2018-201A, U+201C-201E, U+2020-2022, U+2026, U+2030, U+2039-203A, U+2044, U+20AC, U+2122, U+2212, U+FB01-FB02",
  },
  {
    name: "Latin2",
    unicodeRange:
      "U+0100-0101, U+0104-0130, U+0132-0151, U+0154-017F, U+018F, U+0192, U+01A0-01A1, U+01AF-01B0, U+01FA-01FF, U+0218-021B, U+0237, U+0259, U+1E80-1E85, U+1E9E, U+20A1, U+20A4, U+20A6, U+20A8-20AA, U+20AD-20AE, U+20B1-20B2, U+20B4-20B5, U+20B8-20BA, U+20BD, U+20BF",
  },
  { name: "Latin3", unicodeRange: "U+0102-0103, U+01CD-01DC, U+1EA0-1EF9, U+20AB" },
  {
    name: "Cyrillic",
    unicodeRange: "U+0400-045F, U+0462-0463, U+046A-046B, U+0472-0475, U+0490-04C2, U+04CF-04D9, U+04DC-04E9, U+04EE-04F9, U+0524-0525",
  },
  { name: "Greek", unicodeRange: "U+037E, U+0386-038A, U+038C, U+038E-03A1, U+03A3-03CE" },
  {
    name: "Pi",
    unicodeRange:
      "U+0E3F, U+2000-200D, U+2015, U+2028-2029, U+202F, U+2032-2033, U+2070, U+2074-2079, U+2080-2089, U+2113, U+2116, U+2126, U+212E, U+2150-2151, U+2153-215E, U+2190-2199, U+21A9-21AA, U+21B0-21B3, U+21B6-21B7, U+21BA-21BB, U+21C4, U+21C6, U+2202, U+2206, U+220F, U+2211, U+2215, U+221A, U+221E, U+222B, U+2248, U+2260, U+2264-2265, U+25CA, U+2713, U+274C, U+2B0E-2B11, U+ECE0, U+EFCC, U+FEFF, U+FFFD",
  },
];

// Mono ships no Greek, and its Latin3/Pi cover more than the sans equivalents — the split is
// per family, so these are not interchangeable.
const MONO_SUBSETS: FontSubset[] = [
  {
    name: "Latin1",
    unicodeRange:
      "U+0020-007E, U+00A0-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2013-2014, U+2018-201A, U+201C-201E, U+2020-2022, U+2026, U+2030, U+2039-203A, U+2044, U+20AC, U+2122, U+2212, U+FB01-FB02",
  },
  {
    name: "Latin2",
    unicodeRange:
      "U+0100-0101, U+0104-0130, U+0132-0151, U+0154-017F, U+018F, U+0192, U+01A0-01A1, U+01AF-01B0, U+01FA-01FF, U+0218-021B, U+0237, U+0259, U+1E80-1E85, U+1E9E, U+20A1, U+20A4, U+20A6, U+20A8-20AA, U+20AD-20AE, U+20B1-20B2, U+20B4-20B5, U+20B8-20BA, U+20BD, U+20BF",
  },
  {
    name: "Latin3",
    unicodeRange:
      "U+0102-0103, U+01CD-01DC, U+1E0C-1E0D, U+1E12-1E13, U+1E24-1E25, U+1E36-1E37, U+1E3C-1E3D, U+1E40-1E47, U+1E4A-1E4B, U+1E62-1E63, U+1E6C-1E6D, U+1E70-1E71, U+1E92-1E93, U+1EA0-1EF9, U+20AB",
  },
  {
    name: "Cyrillic",
    unicodeRange: "U+0400-045F, U+0462-0463, U+046A-046B, U+0472-0475, U+0490-04C2, U+04CF-04D9, U+04DC-04E9, U+04EE-04F9, U+0524-0525",
  },
  {
    name: "Pi",
    unicodeRange:
      "U+03C0, U+0E3F, U+2000-200D, U+2010-2012, U+2015, U+2028-2029, U+202F, U+2032-2033, U+203E, U+205F, U+2070, U+2074-2079, U+2080-2089, U+2113, U+2116, U+2126, U+212E, U+2150-2151, U+2153-215E, U+2190-2199, U+21A9-21AA, U+21B0-21B3, U+21B6-21B7, U+21BA-21BB, U+21C4, U+21C6, U+2202, U+2206, U+220F, U+2211, U+2215, U+2219-221A, U+221E, U+222B, U+2236, U+2248, U+2260, U+2264-2265, U+2400-2421, U+2500-259F, U+25CA, U+2713, U+274C, U+2B0E-2B11, U+3000, U+FEFF, U+FFFD",
  },
];

export const families = {
  sans: {
    dir: "ibm-plex-sans",
    cssFamily: "IBM Plex Sans",
    fallbacks: "ui-sans-serif, system-ui, sans-serif",
    metrics: { unitsPerEm: 1000, ascent: 1025, descent: -275, lineGap: 0, xWidthAvg: 451 },
    fallback: {
      local: "Arial",
      metrics: { unitsPerEm: 2048, ascent: 1854, descent: -434, lineGap: 67, xWidthAvg: 913 },
    },
    subsets: SANS_SUBSETS,
  },
  mono: {
    dir: "ibm-plex-mono",
    cssFamily: "IBM Plex Mono",
    fallbacks: "ui-monospace, SFMono-Regular, Menlo, monospace",
    metrics: { unitsPerEm: 1000, ascent: 1025, descent: -275, lineGap: 0, xWidthAvg: 600 },
    fallback: {
      local: "Courier New",
      metrics: { unitsPerEm: 2048, ascent: 1705, descent: -615, lineGap: 0, xWidthAvg: 1229 },
    },
    subsets: MONO_SUBSETS,
  },
} as const satisfies Record<string, FontFamily>;

export type FamilyName = keyof typeof families;

export interface FontFace {
  family: FamilyName;
  /**
   * How React Native and SwiftUI resolve the face. IBM Plex abbreviates its style tokens —
   * `-Medm`, not `-Medium`; `-SmBld`, not `-SemiBold`. A wrong name does not error, it falls
   * back to the system font silently, so read it off the file rather than guessing:
   * `fc-scan --format "%{postscriptname}" <file>`.
   */
  postScriptName: string;
  /** Filename stem inside the family folder; format and subset are appended. */
  file: string;
  /**
   * Android resource name, referenced from Typography.kt. Spelled out rather than derived,
   * because no camelCase splitter gets `IBMPlexSans` right — the acronym gives a regex no
   * boundary to find. res/font names must be lowercase snake_case.
   */
  androidName: string;
  /** CSS weight this face answers to. */
  weight: number;
}

export const faces = {
  sans: { family: "sans", postScriptName: "IBMPlexSans", file: "IBMPlexSans-Regular", androidName: "ibm_plex_sans_regular", weight: 400 },
  sansMedium: {
    family: "sans",
    postScriptName: "IBMPlexSans-Medm",
    file: "IBMPlexSans-Medium",
    androidName: "ibm_plex_sans_medium",
    weight: 500,
  },
  sansSemiBold: {
    family: "sans",
    postScriptName: "IBMPlexSans-SmBld",
    file: "IBMPlexSans-SemiBold",
    androidName: "ibm_plex_sans_semibold",
    weight: 600,
  },
  sansBold: { family: "sans", postScriptName: "IBMPlexSans-Bold", file: "IBMPlexSans-Bold", androidName: "ibm_plex_sans_bold", weight: 700 },
  mono: { family: "mono", postScriptName: "IBMPlexMono", file: "IBMPlexMono-Regular", androidName: "ibm_plex_mono_regular", weight: 400 },
  monoMedium: {
    family: "mono",
    postScriptName: "IBMPlexMono-Medm",
    file: "IBMPlexMono-Medium",
    androidName: "ibm_plex_mono_medium",
    weight: 500,
  },
  monoSemiBold: {
    family: "mono",
    postScriptName: "IBMPlexMono-SmBld",
    file: "IBMPlexMono-SemiBold",
    androidName: "ibm_plex_mono_semibold",
    weight: 600,
  },
} as const satisfies Record<string, FontFace>;

export type FaceName = keyof typeof faces;

const ALL_FACES = Object.keys(faces) as FaceName[];
/** What the two widgets' type scales actually set — they run in tight memory budgets. */
const WIDGET_FACES: FaceName[] = ["sansMedium", "sansSemiBold", "monoMedium", "monoSemiBold"];
/** The landing only sets running text and headings. */
const LANDING_FACES: FaceName[] = ["sans", "sansSemiBold"];

interface BaseTarget {
  label: string;
  /** Destination, relative to packages/theme. Gitignored on the receiving side. */
  outDir: string;
  faces: readonly FaceName[];
}

export interface NativeTarget extends BaseTarget {
  kind: "native";
  /** Defaults to the source filename; Android needs its lowercase resource name. */
  fileName?: (face: FontFace) => string;
}

export interface WebTarget extends BaseTarget {
  kind: "web";
  /** How the running site addresses outDir. */
  urlPrefix: string;
  /** Generated @font-face sheet, relative to packages/theme. */
  cssOutFile: string;
}

export type FontTarget = NativeTarget | WebTarget;

export const targets: FontTarget[] = [
  {
    kind: "native",
    label: "React Native app",
    outDir: "../../apps/mobile/assets/fonts",
    faces: ALL_FACES,
  },
  {
    kind: "native",
    label: "iOS widget",
    outDir: "../../apps/mobile/targets/positions-widget/Fonts",
    faces: WIDGET_FACES,
  },
  {
    kind: "native",
    label: "Android widget",
    outDir: "../../apps/mobile/modules/widget-bridge/android/src/main/res/font",
    faces: WIDGET_FACES,
    fileName: (face) => face.androidName,
  },
  {
    kind: "web",
    label: "/app (SSR)",
    outDir: "../../apps/server/src/static/fonts",
    faces: ALL_FACES,
    urlPrefix: "/static/fonts",
    cssOutFile: "dist/css/fonts-app.css",
  },
  {
    kind: "web",
    label: "landing",
    outDir: "../../apps/landing/src/assets/fonts",
    faces: LANDING_FACES,
    urlPrefix: "/assets/fonts",
    cssOutFile: "dist/css/fonts-landing.css",
  },
];

/**
 * Metric overrides that make the fallback occupy the same space as the webfont, so the swap
 * shifts nothing. Same arithmetic as fontaine and next/font: scale the fallback to match
 * average advance width, then restate the webfont's vertical metrics against that scale.
 */
export const fallbackOverrides = (family: FontFamily) => {
  const web = family.metrics;
  const local = family.fallback.metrics;
  const sizeAdjust = web.xWidthAvg / web.unitsPerEm / (local.xWidthAvg / local.unitsPerEm);
  const percent = (value: number) => `${Number((value * 100).toFixed(3))}%`;
  return {
    "size-adjust": percent(sizeAdjust),
    "ascent-override": percent(web.ascent / web.unitsPerEm / sizeAdjust),
    "descent-override": percent(Math.abs(web.descent) / web.unitsPerEm / sizeAdjust),
    "line-gap-override": percent(web.lineGap / web.unitsPerEm / sizeAdjust),
  };
};

/** The family name the generated fallback @font-face registers under. */
export const fallbackFamily = (family: FontFamily) => `${family.cssFamily} Fallback`;
