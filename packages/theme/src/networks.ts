/**
 * Per-network brand colors.
 *
 * Each blockchain keeps its canonical brand color across themes. Use these
 * for network badges, pool/token chips, and accent borders that must remain
 * recognizable independent of light/dark mode.
 */

export type NetworkKey = "ethereum" | "base" | "arbitrum" | "optimism" | "polygon" | "bnb" | "avalanche";

export type NetworkColor = {
  /** Solid brand color — chips, badge fills, icon tints. */
  base: string;
  /** Foreground color that reads on top of `base`. */
  onBase: string;
  /** Low-opacity surface for soft containers (cards, banners). */
  soft: string;
};

export const networkColors: Record<NetworkKey, NetworkColor> = {
  ethereum: { base: "#627EEA", onBase: "#FFFFFF", soft: "rgba(98, 126, 234, 0.14)" },
  base: { base: "#0052FF", onBase: "#FFFFFF", soft: "rgba(0, 82, 255, 0.14)" },
  arbitrum: { base: "#28A0F0", onBase: "#0A0A0B", soft: "rgba(40, 160, 240, 0.14)" },
  optimism: { base: "#FF0420", onBase: "#FFFFFF", soft: "rgba(255, 4, 32, 0.14)" },
  polygon: { base: "#8247E5", onBase: "#FFFFFF", soft: "rgba(130, 71, 229, 0.14)" },
  bnb: { base: "#F3BA2F", onBase: "#0A0A0B", soft: "rgba(243, 186, 47, 0.14)" },
  avalanche: { base: "#E84142", onBase: "#FFFFFF", soft: "rgba(232, 65, 66, 0.14)" },
};
