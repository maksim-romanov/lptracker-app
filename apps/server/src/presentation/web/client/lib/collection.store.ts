import { createLocalStorageAdapter, type IStorageAdapter } from "./storage.adapter";

export abstract class CollectionStore {
  private static adapter: IStorageAdapter = createLocalStorageAdapter();

  static useAdapter(adapter: IStorageAdapter): void {
    CollectionStore.adapter = adapter;
  }

  protected constructor(private readonly key: string) {}

  // Must never reject — a hydrate failure degrades to an empty store instead of aborting the boot sequence that awaits it.
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

  protected abstract load(raw: string | null): void;

  protected abstract dump(): string;
}
