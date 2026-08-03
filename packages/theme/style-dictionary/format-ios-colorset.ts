import type { Format } from "style-dictionary/types";

import { getValue } from "./helpers";

const hexToComponents = (hex: string): { red: number; green: number; blue: number; alpha: number } => {
  const normalized = hex.replace("#", "");
  return {
    red: Number.parseInt(normalized.slice(0, 2), 16) / 255,
    green: Number.parseInt(normalized.slice(2, 4), 16) / 255,
    blue: Number.parseInt(normalized.slice(4, 6), 16) / 255,
    alpha: 1,
  };
};

const colorsetJson = (lightHex: string, darkHex: string): string =>
  `${JSON.stringify(
    {
      colors: [
        { color: { "color-space": "display-p3", components: hexToComponents(lightHex) }, idiom: "universal" },
        {
          appearances: [{ appearance: "luminosity", value: "dark" }],
          color: { "color-space": "display-p3", components: hexToComponents(darkHex) },
          idiom: "universal",
        },
      ],
      info: { version: 1, author: "depthly-theme-codegen" },
    },
    null,
    2,
  )}\n`;

// depthly.{light,dark} field each colorset maps to.
export const DEPTHLY_COLORSET_MAP: Record<string, string> = {
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
};

// networks.<key>.base each chain colorset maps to (mode-independent).
export const NETWORK_COLORSET_MAP: Record<string, string> = {
  chainEthereum: "ethereum",
  chainBase: "base",
  chainArbitrum: "arbitrum",
  chainOptimism: "optimism",
  chainPolygon: "polygon",
  chainBnb: "bnb",
  chainAvalanche: "avalanche",
};

export const formatIosColorset: Format["format"] = ({ dictionary, options }) => {
  const colorsetName = (options as { colorsetName: string }).colorsetName;

  if (colorsetName in DEPTHLY_COLORSET_MAP) {
    const field = DEPTHLY_COLORSET_MAP[colorsetName];
    const light = getValue(dictionary.allTokens, ["color", "depthly", "light", field]) as string;
    const dark = getValue(dictionary.allTokens, ["color", "depthly", "dark", field]) as string;
    return colorsetJson(light, dark);
  }

  const network = NETWORK_COLORSET_MAP[colorsetName];
  const base = getValue(dictionary.allTokens, ["color", "networks", network, "base"]) as string;
  return colorsetJson(base, base);
};
