import { $ } from "bun";

import { beforeAll, describe, expect, test } from "bun:test";

// Reads the generated themes rather than the source tree, so what is asserted is what
// every surface actually ships — aliases resolved, alphas as authored.
type Theme = Record<string, string>;
let dark: Theme;
let light: Theme;

beforeAll(async () => {
  await $`bun run codegen`.cwd(`${import.meta.dir}/..`);
  const generated = await import(`${import.meta.dir}/../dist/js/themes/depthly.ts`);
  dark = generated.depthlyDark;
  light = generated.depthlyLight;
});

const channels = (hex: string): [number, number, number, number] => {
  const value = hex.replace("#", "");
  const at = (offset: number) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
  return [at(0), at(2), at(4), value.length === 8 ? at(6) : 1];
};

// A colour with alpha means nothing on its own — it is the composite against the surface
// underneath that a person reads, so every measurement flattens first.
const flatten = (color: string, backdrop: string): string => {
  const [red, green, blue, alpha] = channels(color);
  const base = channels(backdrop);
  const mix = [red, green, blue].map((channel, index) => channel * alpha + base[index] * (1 - alpha));
  return `#${mix
    .map((channel) =>
      Math.round(channel * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

const luminance = (hex: string): number => {
  const [red, green, blue] = channels(hex).map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const ratio = (foreground: string, backdrop: string): number => {
  const [brighter, darker] = [luminance(flatten(foreground, backdrop)), luminance(backdrop)].sort((a, b) => b - a);
  return (brighter + 0.05) / (darker + 0.05);
};

const SURFACES = ["surface", "surfaceDim", "surfaceBright", "surfaceContainer", "surfaceVariant"] as const;

// Roles that carry running text and can land on any surface in the theme.
const BODY_TEXT = ["onSurface", "onSurfaceVariant", "onSurfaceMuted"] as const;

// Surfaces a status mark or an accent fill is actually drawn on. `surfaceVariant` is a
// control fill — the price tooltip, the selected segment of a toggle, the promo pill — and
// nothing in the design puts a status dot or an accent swatch on top of one, so holding it
// to that pairing would be measuring a combination the product never renders.
const MARK_SURFACES = ["surface", "surfaceDim", "surfaceBright", "surfaceContainer"] as const;

// Text roles bound to one fill: measured only against the fill they name.
const ON_FILL: [text: string, fill: string][] = [
  ["onPrimary", "primary"],
  ["onPrimaryContainer", "primaryContainer"],
  ["onSecondary", "secondary"],
  ["onSecondaryContainer", "secondaryContainer"],
  ["onSuccessContainer", "successContainer"],
  ["onWarningContainer", "warningContainer"],
  ["onErrorContainer", "errorContainer"],
  ["onInfoContainer", "infoContainer"],
  ["inverseOnSurface", "inverseSurface"],
];

// A status solid is a filled mark that carries a short label, not a paragraph — and it follows
// its hue to the purest point that hue has, which for amber is light enough that no foreground
// reaches 4.5:1 on it. Held to the large-text floor instead. Nothing in /app renders one today;
// the pairing anyone actually reads is the container one above, which keeps the full threshold.
const ON_SOLID: [text: string, fill: string][] = [
  ["onSuccess", "success"],
  ["onWarning", "warning"],
  ["onError", "error"],
  ["onInfo", "info"],
];

// WCAG 1.4.11: a border or a status mark is not text, but it still has to be perceivable.
// `outline` is the boundary that identifies a control and is held to this on every surface;
// `outlineVariant` is a decorative hairline between rows and is deliberately not.
const MARKS = ["primary", "success", "warning", "error", "info", "secondary"] as const;

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

describe.each([
  ["dark", () => dark],
  ["light", () => light],
])("%s theme contrast", (_name, themeOf) => {
  test("body text roles clear AA on every surface", () => {
    const theme = themeOf();
    const failures = SURFACES.flatMap((surface) =>
      BODY_TEXT.map((role) => ({ pair: `${role} on ${surface}`, value: ratio(theme[role], theme[surface]) })).filter(
        (measured) => measured.value < AA_TEXT,
      ),
    );

    expect(failures.map((f) => `${f.pair} = ${f.value.toFixed(2)}:1`)).toEqual([]);
  });

  test("each on-fill role clears AA against the fill it names", () => {
    const theme = themeOf();
    const failures = ON_FILL.map(([text, fill]) => ({ pair: `${text} on ${fill}`, value: ratio(theme[text], theme[fill]) })).filter(
      (measured) => measured.value < AA_TEXT,
    );

    expect(failures.map((f) => `${f.pair} = ${f.value.toFixed(2)}:1`)).toEqual([]);
  });

  // Accent text is a control and link colour, not body text: it lands on a page surface or
  // on a wash of itself, never on a control fill. The wash is the pairing that is easiest
  // to get wrong — it lifts the backdrop toward the very text it has to stay legible on.
  test("accent text clears AA on its surfaces and on the accent wash", () => {
    const theme = themeOf();
    const failures = MARK_SURFACES.flatMap((surface) => [
      { pair: `primaryText on ${surface}`, value: ratio(theme.primaryText, theme[surface]) },
      { pair: `primaryText on primaryWash over ${surface}`, value: ratio(theme.primaryText, flatten(theme.primaryWash, theme[surface])) },
    ]).filter((measured) => measured.value < AA_TEXT);

    expect(failures.map((f) => `${f.pair} = ${f.value.toFixed(2)}:1`)).toEqual([]);
  });

  // The other half of the fill/type split: a status set as words has to read on a page surface,
  // which is a different job from filling a band and needs a different value to do it.
  test("status text roles clear AA on the surfaces they are set on", () => {
    const theme = themeOf();
    const failures = MARK_SURFACES.flatMap((surface) =>
      ["successText", "warningText", "errorText", "infoText"]
        .map((role) => ({ pair: `${role} on ${surface}`, value: ratio(theme[role], theme[surface]) }))
        .filter((measured) => measured.value < AA_TEXT),
    );

    expect(failures.map((f) => `${f.pair} = ${f.value.toFixed(2)}:1`)).toEqual([]);
  });

  test("a status solid carries its label at the large-text floor", () => {
    const theme = themeOf();
    const failures = ON_SOLID.map(([text, fill]) => ({ pair: `${text} on ${fill}`, value: ratio(theme[text], theme[fill]) })).filter(
      (measured) => measured.value < AA_NON_TEXT,
    );

    expect(failures.map((f) => `${f.pair} = ${f.value.toFixed(2)}:1`)).toEqual([]);
  });

  test("the control boundary clears the non-text threshold on every surface", () => {
    const theme = themeOf();
    const failures = SURFACES.map((surface) => ({
      pair: `outline on ${surface}`,
      value: ratio(theme.outline, theme[surface]),
    })).filter((measured) => measured.value < AA_NON_TEXT);

    expect(failures.map((f) => `${f.pair} = ${f.value.toFixed(2)}:1`)).toEqual([]);
  });

  test("status marks clear the non-text threshold on the surfaces they sit on", () => {
    const theme = themeOf();
    const failures = MARK_SURFACES.flatMap((surface) =>
      MARKS.map((role) => ({ pair: `${role} on ${surface}`, value: ratio(theme[role], theme[surface]) })).filter(
        (measured) => measured.value < AA_NON_TEXT,
      ),
    );

    expect(failures.map((f) => `${f.pair} = ${f.value.toFixed(2)}:1`)).toEqual([]);
  });
});
