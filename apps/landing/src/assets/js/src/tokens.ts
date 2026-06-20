// Order is significant: index → atlas slot (left-to-right, top-to-bottom) and
// the tokenIndex passed to the shader. Adding a token = entry here + SVG under
// src/assets/img/tokens/<ticker>.svg.
// Colour components >1.0 are intentional: the scene heartbeat dims by ~4%, so
// the boost keeps brand hues recognisable rather than muted.

export interface TokenConfig {
  ticker: string;
  color: [number, number, number];
}

export const ATLAS_COLS = 4;

export const TOKENS: readonly TokenConfig[] = [
  { ticker: "ETH", color: [0.5, 0.55, 1.05] },
  { ticker: "USDC", color: [0.2, 0.5, 1.2] },
  { ticker: "USDT", color: [0.3, 0.95, 0.7] },
  { ticker: "BNB", color: [1.2, 0.78, 0.1] },
  { ticker: "MATIC", color: [0.65, 0.3, 1.2] },
  { ticker: "AVAX", color: [1.2, 0.3, 0.3] },
  { ticker: "LINK", color: [0.3, 0.55, 1.2] },
  { ticker: "ARB", color: [0.3, 0.63, 1.2] },
  { ticker: "OP", color: [1.2, 0.2, 0.22] },
  { ticker: "BASE", color: [0.2, 0.42, 1.2] },
];
