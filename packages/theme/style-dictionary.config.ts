import type { Config } from "style-dictionary/types";

import { formatColors } from "./style-dictionary/format-colors";
import { formatDaisyuiCss } from "./style-dictionary/format-daisyui-css";
import { DEPTHLY_COLORSET_MAP, formatIosColorset, NETWORK_COLORSET_MAP } from "./style-dictionary/format-ios-colorset";
import { formatNetworks } from "./style-dictionary/format-networks";
import { formatSpacingRadius } from "./style-dictionary/format-spacing-radius";
import { formatThemeDepthly } from "./style-dictionary/format-theme-depthly";
import { formatTypography } from "./style-dictionary/format-typography";

const iosColorsetFiles = [...Object.keys(DEPTHLY_COLORSET_MAP), ...Object.keys(NETWORK_COLORSET_MAP)].map((colorsetName) => ({
  destination: `${colorsetName}.colorset/Contents.json`,
  format: "depthly-ios/colorset",
  options: { colorsetName },
}));

export default {
  source: ["tokens/color/**/*.ts", "tokens/typography.ts", "tokens/spacing.ts"],
  hooks: {
    transforms: {
      // Style Dictionary's default name (last path segment only) collides by
      // design across ramp shades ("500" in blue/neonPink/...) and light/dark
      // fields ("primary" in both modes). Every custom format here reads
      // token.path directly, never token.name, so the name only needs to be
      // unique — deriving it from the full path avoids the collision warning
      // without touching the values the formats actually consume.
      "depthly/name-by-path": {
        type: "name",
        transform: (token) => token.path.join("."),
      },
    },
    formats: {
      "depthly-js/colors": formatColors,
      "depthly-js/theme-depthly": formatThemeDepthly,
      "depthly-js/typography": formatTypography,
      "depthly-js/spacing-radius": formatSpacingRadius,
      "depthly-js/networks": formatNetworks,
      "depthly-css/daisyui": formatDaisyuiCss,
      "depthly-ios/colorset": formatIosColorset,
    },
  },
  platforms: {
    js: {
      transforms: ["depthly/name-by-path"],
      buildPath: "dist/js/",
      files: [
        { destination: "colors.ts", format: "depthly-js/colors" },
        { destination: "themes/depthly.ts", format: "depthly-js/theme-depthly" },
        { destination: "typography.ts", format: "depthly-js/typography" },
        { destination: "spacing.ts", format: "depthly-js/spacing-radius" },
        { destination: "networks.ts", format: "depthly-js/networks" },
      ],
    },
    css: {
      transforms: ["depthly/name-by-path"],
      buildPath: "dist/css/",
      files: [{ destination: "depthly.css", format: "depthly-css/daisyui" }],
    },
    ios: {
      transforms: ["depthly/name-by-path"],
      buildPath: "../../apps/mobile/targets/positions-widget/Assets.xcassets/",
      files: iosColorsetFiles,
    },
  },
} satisfies Config;
