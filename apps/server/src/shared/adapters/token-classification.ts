const STABLECOIN_SYMBOLS = new Set(["USDC", "USDT", "DAI", "FRAX", "TUSD", "BUSD", "USDP", "LUSD", "PYUSD", "USDE", "GUSD", "FDUSD", "USDD"]);

/**
 * Returns the recommended number of decimal places for UI display, or undefined
 * if no hint applies (client should use its default precision).
 *
 * Stablecoins return 2 because pricing-grade precision (cents) is enough.
 * Volatile tokens (ETH, BTC, …) return undefined so the client picks its own.
 */
export function getDisplayDecimals(symbol: string): number | undefined {
  return STABLECOIN_SYMBOLS.has(symbol.toUpperCase()) ? 2 : undefined;
}
