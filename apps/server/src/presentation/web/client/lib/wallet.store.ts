import { CollectionStore } from "./collection.store";
import { WalletEntry } from "./wallet.entity";

// Wallets are unique by address → keyed Map (dedup is intrinsic).
class WalletStore extends CollectionStore {
  private entries = new Map<string, WalletEntry>();

  constructor() {
    super("wallets");
  }

  protected load(raw: string | null): void {
    this.entries = new Map(
      this.parse<string[]>(raw, []).map((s) => {
        const entry = WalletEntry.parse(s);
        return [entry.address, entry] as const;
      }),
    );
  }

  protected dump(): string {
    return JSON.stringify([...this.entries.values()].map(String));
  }

  add(entry: WalletEntry): void {
    if (this.entries.has(entry.address)) return; // keep the existing entry on duplicate address
    this.entries.set(entry.address, entry);
    this.persist();
  }

  remove(address: string): void {
    if (this.entries.delete(address.toLowerCase())) this.persist();
  }

  serialize(): string {
    return [...this.entries.values()].join("|");
  }

  list(): WalletEntry[] {
    return [...this.entries.values()];
  }
}

export const walletStore = new WalletStore();
