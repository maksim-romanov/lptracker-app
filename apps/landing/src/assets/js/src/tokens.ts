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
  { ticker: "BTC", color: [1.2, 0.7, 0.12] },
  { ticker: "ETH", color: [0.5, 0.55, 1.05] },
  { ticker: "USDT", color: [0.3, 0.95, 0.7] },
  { ticker: "BNB", color: [1.2, 0.78, 0.1] },
  { ticker: "SOL", color: [0.78, 0.3, 1.2] },
  { ticker: "USDC", color: [0.2, 0.5, 1.2] },
  { ticker: "XRP", color: [0.4, 0.4, 0.4] },
  { ticker: "DOGE", color: [1.15, 0.78, 0.2] },
  { ticker: "ADA", color: [0.18, 0.45, 0.95] },
  { ticker: "AVAX", color: [1.2, 0.3, 0.3] },
  { ticker: "TRX", color: [1.15, 0.3, 0.3] },
  { ticker: "LINK", color: [0.3, 0.55, 1.2] },
  { ticker: "MATIC", color: [0.65, 0.3, 1.2] },
  { ticker: "DOT", color: [1.2, 0.3, 0.7] },
];
