export type TStableEntry = {
  chainId: number;
  address: string;
  symbol: string;
};

export const stableKey = (chainId: number, address: string): string => `${chainId}:${address.toLowerCase()}`;

export const dedupeStables = (entries: TStableEntry[]): TStableEntry[] => {
  const seen = new Map<string, TStableEntry>();
  for (const entry of entries) {
    const key = stableKey(entry.chainId, entry.address);
    if (!seen.has(key)) {
      seen.set(key, { chainId: entry.chainId, address: entry.address.toLowerCase(), symbol: entry.symbol });
    }
  }
  return Array.from(seen.values());
};

export const sortStables = (entries: TStableEntry[]): TStableEntry[] =>
  [...entries].sort((a, b) => {
    if (a.chainId !== b.chainId) return a.chainId - b.chainId;
    return a.address.localeCompare(b.address);
  });
