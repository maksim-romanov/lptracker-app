import { CollectionStore } from "./collection.store";
import { type TWalletSource, WalletEntry } from "./wallet.entity";

// Wallets are unique by address → keyed Map (dedup is intrinsic). At most one of them is the
// signer: connecting a second wallet replaces the first, but it must not touch the watched
// addresses, which is what `clear()` used to do to the whole list.
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

  // Watching an address already being watched keeps the existing entry, nickname and all.
  // Watching the connected one would silently demote it, so it is left alone.
  watch(entry: WalletEntry): void {
    if (this.entries.has(entry.address)) return;
    this.entries.set(entry.address, entry);
    this.persist();
  }

  // Connecting promotes the address if it was already being watched, so the same wallet never
  // appears in both groups.
  connect(entry: WalletEntry): void {
    // Read before the cleanup loop below can delete this same address (reconnecting the
    // current signer is itself a "connected" entry) — otherwise the lookup misses and the
    // reconnect silently drops the nickname.
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
