import { defineTokens } from "./kit/core";
import { daisyuiTheme } from "./kit/plugins/daisyui";
import { iosColorsets } from "./kit/plugins/ios-colorsets";
import { jsModules } from "./kit/plugins/js-modules";
import type { Resolved } from "./kit/tree";
import { constExport, objectType, stringUnion, typeAlias } from "./kit/ts-emit";
import depthlyTokens from "./tokens/color/depthly";
import networkTokens from "./tokens/color/networks";
import paletteTokens from "./tokens/color/palette";
import spacingTokens from "./tokens/spacing";
import typographyTokens from "./tokens/typography";

const tokens = {
  color: { ...paletteTokens.color, ...depthlyTokens.color, ...networkTokens.color },
  spacing: spacingTokens.spacing,
  radius: spacingTokens.radius,
  typography: typographyTokens.typography,
};

type Tokens = typeof tokens;
type Tree = Resolved<Tokens>;

const generatedHeader = (source: string) => `// GENERATED FILE — do not edit. Source: ${source}`;

const daisyuiColors = (mode: Tree["color"]["depthly"]["light"]) => ({
  "--color-base-100": mode.surface,
  "--color-base-200": mode.surfaceContainer,
  "--color-base-300": mode.surfaceVariant,
  "--color-base-content": mode.onSurface,
  "--color-primary": mode.primary,
  "--color-primary-content": mode.onPrimary,
  "--color-secondary": mode.secondary,
  "--color-secondary-content": mode.onSecondary,
  "--color-accent": mode.secondary,
  "--color-accent-content": mode.onSecondary,
  "--color-neutral": mode.surfaceVariant,
  "--color-neutral-content": mode.onSurfaceVariant,
  "--color-info": mode.secondary,
  "--color-info-content": mode.onSecondary,
  "--color-success": mode.success,
  "--color-success-content": mode.onSuccess,
  "--color-warning": mode.warning,
  "--color-warning-content": mode.onWarning,
  "--color-error": mode.error,
  "--color-error-content": mode.onError,
});

// SSR-local structural constants — not sourced from tokens yet (same in both modes today).
// Pending the future re-skin phase — see apps/server/design-system/depthly-app/MASTER.md.
const ssrStructuralDeclarations = {
  "--radius-selector": "0.75rem",
  "--radius-field": "2rem",
  "--radius-box": "1.5rem",
  "--size-selector": "0.28125rem",
  "--size-field": "0.28125rem",
  "--border": "1px",
  "--depth": "1",
  "--noise": "0",
};

// depthly.{light,dark} field each colorset maps to.
const semanticColorsets = {
  bgPrimary: "surface",
  bgSurface: "surfaceContainer",
  bgVariant: "surfaceVariant",
  textPrimary: "onSurface",
  textMuted: "onSurfaceVariant",
  borderOutline: "outline",
  brandPrimary: "primary",
  brandGlow: "shadow",
  statusInRange: "success",
  statusOutOfRange: "warning",
  statusError: "error",
} as const;

// networks.<key>.base each chain colorset maps to (mode-independent).
const networkColorsets = {
  chainEthereum: "ethereum",
  chainBase: "base",
  chainArbitrum: "arbitrum",
  chainOptimism: "optimism",
  chainPolygon: "polygon",
  chainBnb: "bnb",
  chainAvalanche: "avalanche",
} as const;

export default defineTokens({
  tokens,
  plugins: [
    jsModules<Tokens>({
      outDir: "dist/js",
      files: {
        "colors.ts": {
          header: generatedHeader("packages/theme/tokens/color/palette.ts, depthly.ts"),
          statements: (tree) => [
            typeAlias("ColorTokens", objectType(Object.keys(tree.color.depthly.dark).map((field) => [field, "string"] as const))),
            constExport("palette", tree.color.palette, { asConst: true }),
          ],
        },
        "themes/depthly.ts": {
          header: generatedHeader("packages/theme/tokens/color/depthly.ts"),
          statements: (tree) => [
            'import type { ColorTokens } from "../colors";',
            constExport("depthlyDark", tree.color.depthly.dark, { type: "ColorTokens" }),
            constExport("depthlyLight", tree.color.depthly.light, { type: "ColorTokens" }),
          ],
        },
        "typography.ts": {
          header: generatedHeader("packages/theme/tokens/typography.ts"),
          statements: (tree) => {
            const roles = tree.typography.role;
            const fontWeights = [...new Set(Object.values(roles).map((role) => role.fontWeight))].sort();
            return [
              typeAlias("FontWeight", stringUnion(fontWeights)),
              typeAlias(
                "TextStyleType",
                objectType([
                  ["fontFamily", "string"],
                  ["fontSize", "number"],
                  ["fontWeight", "FontWeight"],
                  ["lineHeight", "number"],
                  ["letterSpacing", "number"],
                ]),
              ),
              typeAlias("TypographyTokens", objectType(Object.keys(roles).map((role) => [role, "TextStyleType"] as const))),
              constExport("fontFamily", tree.typography.fontFamily, { asConst: true }),
              constExport("lineHeight", tree.typography.lineHeight, { asConst: true }),
              constExport("letterSpacing", tree.typography.letterSpacing, { asConst: true }),
              constExport("typography", roles, { type: "TypographyTokens" }),
            ];
          },
        },
        "spacing.ts": {
          header: generatedHeader("packages/theme/tokens/spacing.ts"),
          statements: (tree) => [
            constExport("spacing", tree.spacing, { asConst: true }),
            [typeAlias("SpacingKey", "keyof typeof spacing"), typeAlias("SpacingValue", "(typeof spacing)[SpacingKey]")].join("\n"),
            constExport("radius", tree.radius, { asConst: true }),
            [typeAlias("RadiusKey", "keyof typeof radius"), typeAlias("RadiusValue", "(typeof radius)[RadiusKey]")].join("\n"),
          ],
        },
        "networks.ts": {
          header: generatedHeader("packages/theme/tokens/color/networks.ts"),
          statements: (tree) => [
            typeAlias("NetworkKey", stringUnion(Object.keys(tree.color.networks))),
            typeAlias(
              "NetworkColor",
              objectType([
                ["base", "string"],
                ["onBase", "string"],
                ["soft", "string"],
              ]),
            ),
            constExport("networkColors", tree.color.networks, { type: "Record<NetworkKey, NetworkColor>", inlineFromDepth: 1 }),
          ],
        },
      },
    }),
    daisyuiTheme<Tokens>({
      outFile: "dist/css/depthly.css",
      headerComments: [
        "/* GENERATED FILE — do not edit. Source: packages/theme/tokens/color/depthly.ts */",
        "/* radius/depth/border/noise below are SSR-local constants, not yet from @depthly/theme */",
      ],
      themes: (tree) => [
        {
          name: "depthly-light",
          colorScheme: "light",
          default: true,
          colors: daisyuiColors(tree.color.depthly.light),
          extra: ssrStructuralDeclarations,
        },
        {
          name: "depthly-dark",
          colorScheme: "dark",
          prefersdark: true,
          colors: daisyuiColors(tree.color.depthly.dark),
          extra: ssrStructuralDeclarations,
        },
      ],
    }),
    iosColorsets<Tokens>({
      outDir: "../../apps/mobile/targets/positions-widget/Assets.xcassets",
      author: "depthly-theme-codegen",
      colorSpace: "srgb",
      entries: (tree) => ({
        ...Object.fromEntries(
          Object.entries(semanticColorsets).map(([colorsetName, field]) => [
            colorsetName,
            { light: tree.color.depthly.light[field], dark: tree.color.depthly.dark[field] },
          ]),
        ),
        ...Object.fromEntries(
          Object.entries(networkColorsets).map(([colorsetName, network]) => [
            colorsetName,
            { light: tree.color.networks[network].base, dark: tree.color.networks[network].base },
          ]),
        ),
      }),
    }),
  ],
});
