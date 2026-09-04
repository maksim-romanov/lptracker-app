import { CollectionStore } from "./collection.store";
import { type TWalletSource, WalletEntry } from "./wallet.entity";

// Unique by address (Map dedups). At most one entry is the signer — connecting a second wallet
// replaces the first but must never touch the watched addresses.
class WalletStore extends CollectionStore {
  private entries = new Map<string, WalletEntry>();

  constructor() {
    super("wallets");
  }

  protected load(raw: string | null): void {
    this.entries = new Map(
      this.parse<unknown[]>(raw, [])
        .map((value) => WalletEntry.fromStored(value))
        .filter((entry): entry is WalletEntry => entry !== null)
        .map((entry) => [entry.address, entry] as const),
    );
  }

  protected dump(): string {
    return JSON.stringify([...this.entries.values()].map((entry) => entry.toStored()));
  }

  // A no-op if already watched — otherwise re-watching the connected address would demote it.
  watch(entry: WalletEntry): void {
    if (this.entries.has(entry.address)) return;
    this.entries.set(entry.address, entry);
    this.persist();
  }

  connect(entry: WalletEntry): void {
    // Must read before the cleanup loop below deletes this same address — reconnecting the
    // current signer is itself a "connected" entry, and reading after the loop would silently
    // drop its nickname.
    const existing = this.entries.get(entry.address);
    for (const [address, other] of this.entries) {
      if (other.source === "connected") this.entries.delete(address);
    }
    this.entries.set(entry.address, (existing ?? entry).withSource("connected"));
    this.persist();
  }

  disconnect(): void {
    for (const [address, entry] of this.entries) {
      if (entry.source === "connected") this.entries.delete(address);
    }
    this.persist();
  }

  remove(address: string): void {
    if (this.entries.delete(address.toLowerCase())) this.persist();
  }

  rename(address: string, label: string): void {
    const entry = this.entries.get(address.toLowerCase());
    if (!entry) return;
    this.entries.set(entry.address, WalletEntry.create(entry.address, entry.chainIds, entry.source, label.trim() || null) ?? entry);
    this.persist();
  }

  serialize(): string {
    return [...this.entries.values()].join("|");
  }

  list(): WalletEntry[] {
    return [...this.entries.values()];
  }

  bySource(source: TWalletSource): WalletEntry[] {
    return this.list().filter((entry) => entry.source === source);
  }
}

export const walletStore = new WalletStore();
