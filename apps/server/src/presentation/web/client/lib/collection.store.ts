// Swappable client-storage mechanism (Adapter pattern) — localStorage now, a
// future Telegram CloudStorage later. Async + per-key so both fit.
export interface IStorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

const localStorageAdapter: IStorageAdapter = {
  get: (key) => Promise.resolve(localStorage.getItem(key)),
  set: (key, value) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
};

// Base for a single persisted collection: resolves the storage adapter and owns
// the hydrate/persist lifecycle. The on-disk shape is opaque to the base — each
// subclass holds its own in-memory structure and (de)serializes via load/dump.
export abstract class CollectionStore {
  private static adapter: IStorageAdapter = localStorageAdapter;

  // Swap the storage mechanism for ALL stores (e.g. CloudStorage). Default: localStorage.
  static useAdapter(adapter: IStorageAdapter): void {
    CollectionStore.adapter = adapter;
  }

  protected constructor(private readonly key: string) {}

  async hydrate(): Promise<void> {
    this.load(await CollectionStore.adapter.get(this.key));
  }

  protected persist(): void {
    void CollectionStore.adapter.set(this.key, this.dump());
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
