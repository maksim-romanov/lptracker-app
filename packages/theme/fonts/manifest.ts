// The font files in this folder are the only copies checked in. Every surface that needs
// them gets its own subset written by `bun run codegen` (see kit/plugins/font-assets.ts),
// so adding a family means dropping its files in a folder here and adding entries below —
// not copying binaries into five app directories by hand.

export interface FontFamily {
  /** Folder under packages/theme/fonts holding this family's files. */
  dir: string;
  /** Family name as the web resolves it, and as it appears in @font-face. */
  cssFamily: string;
  /** Appended after cssFamily to form the CSS stack. */
  fallbacks: string;
}

export const families = {
  sans: {
    dir: "ibm-plex-sans",
    cssFamily: "IBM Plex Sans",
    fallbacks: "ui-sans-serif, system-ui, sans-serif",
  },
  mono: {
    dir: "ibm-plex-mono",
    cssFamily: "IBM Plex Mono",
    fallbacks: "ui-monospace, SFMono-Regular, Menlo, monospace",
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
  /** Filename stem inside the family folder; the extension comes from the target format. */
  file: string;
  /**
   * Android resource name, referenced from Typography.kt. Spelled out rather than derived,
   * because no camelCase splitter gets `IBMPlexSans` right — the acronym has no boundary
   * a regex can see. res/font names must be lowercase snake_case.
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

export interface FontTarget {
  label: string;
  /** Destination, relative to packages/theme. Gitignored on the receiving side. */
  outDir: string;
  format: "ttf" | "woff2";
  faces: readonly FaceName[];
  /** Defaults to the source filename. Android resource names must be lowercase snake_case. */
  fileName?: (face: FontFace) => string;
}

export const targets: FontTarget[] = [
  {
    label: "React Native app",
    outDir: "../../apps/mobile/assets/fonts",
    format: "ttf",
    faces: ALL_FACES,
  },
  {
    label: "iOS widget",
    outDir: "../../apps/mobile/targets/positions-widget/Fonts",
    format: "ttf",
    faces: WIDGET_FACES,
  },
  {
    label: "Android widget",
    outDir: "../../apps/mobile/modules/widget-bridge/android/src/main/res/font",
    format: "ttf",
    faces: WIDGET_FACES,
    fileName: (face) => face.androidName,
  },
  {
    label: "/app (SSR)",
    outDir: "../../apps/server/src/static/fonts",
    format: "woff2",
    faces: ALL_FACES,
  },
  {
    label: "landing",
    outDir: "../../apps/landing/src/assets/fonts",
    format: "woff2",
    faces: LANDING_FACES,
  },
];
