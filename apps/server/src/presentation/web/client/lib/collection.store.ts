import { createLocalStorageAdapter, type IStorageAdapter } from "./storage.adapter";

// Base for a single persisted collection: resolves the storage adapter and owns
// the hydrate/persist lifecycle. The on-disk shape is opaque to the base — each
// subclass holds its own in-memory structure and (de)serializes via load/dump.
export abstract class CollectionStore {
  private static adapter: IStorageAdapter = createLocalStorageAdapter();

  // Swap the storage mechanism for ALL stores (e.g. CloudStorage). Default: localStorage.
  static useAdapter(adapter: IStorageAdapter): void {
    CollectionStore.adapter = adapter;
  }

  protected constructor(private readonly key: string) {}

  // Never rejects: a hydrate failure must degrade to an empty store, not abort
  // the boot sequence that awaits it (application.ts).
  async hydrate(): Promise<void> {
    let raw: string | null = null;
    try {
      raw = await CollectionStore.adapter.get(this.key);
    } catch {
      raw = null;
    }
    this.load(raw);
  }

  protected persist(): void {
    void CollectionStore.adapter.set(this.key, this.dump()).catch(() => {
      // Storage is unavailable — in-memory state stays authoritative for the session.
    });
  }

  protected parse<T>(raw: string | null, fallback: T): T {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  // Rebuild the in-memory structure from the stored raw string (or null).
  protected abstract load(raw: string | null): void;

  // Serialize the in-memory structure to the raw string to persist.
  protected abstract dump(): string;
}
