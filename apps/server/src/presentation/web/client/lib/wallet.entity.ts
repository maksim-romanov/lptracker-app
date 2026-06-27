const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

// Immutable value object for a tracked wallet. Construct only via the static
// factories: `create` validates raw user input, `parse` rehydrates a persisted
// `address:chainId,chainId` string. `toString` is the inverse of `parse`, so
// Array.join / String() / JSON round-trips produce the wire form implicitly.
export class WalletEntry {
  private constructor(
    readonly address: string,
    readonly chainIds: number[],
  ) {}

  static create(address: string, chainIds: number[]): WalletEntry | null {
    if (!ADDRESS_RE.test(address) || chainIds.length === 0) return null;
    return new WalletEntry(address.toLowerCase(), [...chainIds]);
  }

  static parse(raw: string): WalletEntry {
    const [address = "", chains = ""] = raw.split(":");
    return new WalletEntry(address.toLowerCase(), chains.split(",").filter(Boolean).map(Number));
  }

  toString(): string {
    return `${this.address}:${this.chainIds.join(",")}`;
  }

  shortLabel(): string {
    return `${this.address.slice(0, 6)}…${this.address.slice(-4)}`;
  }
}
