const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export type TWalletSource = "connected" | "watched";

export interface IStoredWallet {
  address: string;
  chainIds: number[];
  source: TWalletSource;
  label: string | null;
}

export const shortAddress = (address: string): string => `${address.slice(0, 6)}…${address.slice(-4)}`;

const isStored = (value: unknown): value is IStoredWallet =>
  typeof value === "object" && value !== null && typeof (value as IStoredWallet).address === "string";

/**
 * Immutable value object for a tracked wallet. Construct only via the static factories.
 *
 * `toString`/`parse` is the wire form the server validates (`address:chainId,chainId`) and
 * carries no nickname; `toStored`/`fromStored` is the storage form and carries everything.
 */
export class WalletEntry {
  private constructor(
    readonly address: string,
    readonly chainIds: number[],
    readonly source: TWalletSource,
    readonly label: string | null,
  ) {}

  static create(address: string, chainIds: number[], source: TWalletSource, label: string | null = null): WalletEntry | null {
    if (!ADDRESS_RE.test(address) || chainIds.length === 0) return null;
    return new WalletEntry(address.toLowerCase(), [...chainIds], source, label);
  }

  static parse(raw: string, source: TWalletSource = "watched"): WalletEntry {
    const [address = "", chains = ""] = raw.split(":");
    return new WalletEntry(address.toLowerCase(), chains.split(",").filter(Boolean).map(Number), source, null);
  }

  // A bare string predates source tracking, so it's read back as a pasted (watched) address.
  static fromStored(value: unknown): WalletEntry | null {
    if (typeof value === "string") return WalletEntry.parse(value);
    if (!isStored(value)) return null;
    return WalletEntry.create(value.address, value.chainIds ?? [], value.source === "connected" ? "connected" : "watched", value.label ?? null);
  }

  get displayName(): string {
    return this.label ?? shortAddress(this.address);
  }

  withSource(source: TWalletSource): WalletEntry {
    return new WalletEntry(this.address, this.chainIds, source, this.label);
  }

  toStored(): IStoredWallet {
    return { address: this.address, chainIds: this.chainIds, source: this.source, label: this.label };
  }

  toString(): string {
    return `${this.address}:${this.chainIds.join(",")}`;
  }
}
