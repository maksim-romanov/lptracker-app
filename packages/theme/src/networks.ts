/**
 * Per-blockchain semantic colors. Identity colors don't change between
 * light/dark themes; only the variant used does.
 *
 * - `fg` — strong tone for solid badges and icons
 * - `fgSoft` — desaturated tone for use on dark surfaces
 */

export const networks = {
  ethereum: { fg: "#627EEA", fgSoft: "#A8B7FF" },
  arbitrum: { fg: "#28A0F0", fgSoft: "#7CC8FF" },
  optimism: { fg: "#FF0420", fgSoft: "#FF6878" },
  base: { fg: "#0052FF", fgSoft: "#5C8EFF" },
  polygon: { fg: "#8247E5", fgSoft: "#B388FF" },
  bnb: { fg: "#F0B90B", fgSoft: "#FFD64A" },
  avalanche: { fg: "#E84142", fgSoft: "#FF7878" },
  tron: { fg: "#FF0013", fgSoft: "#FF6878" },
  solana: { fg: "#9945FF", fgSoft: "#C29CFF" },
  unknown: { fg: "#8E8E99", fgSoft: "#B0B0BA" },
} as const;

export type NetworkKey = keyof typeof networks;
export type NetworkTokens = typeof networks;
