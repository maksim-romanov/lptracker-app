// Swappable client-storage mechanism (Adapter pattern) — localStorage now, a
// future Telegram CloudStorage later. Async + per-key so both fit.
export interface IStorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export const createMemoryAdapter = (): IStorageAdapter => {
  const cache = new Map<string, string>();
  return {
    get: (key) => Promise.resolve(cache.get(key) ?? null),
    set: (key, value) => {
      cache.set(key, value);
      return Promise.resolve();
    },
  };
};

// Touching `localStorage` throws outright — not returns null — when storage is
// partitioned or blocked (Telegram webview, Safari private mode, third-party
// iframe with cookies off), so the property access itself has to be guarded.
// The first failure demotes the adapter to memory for the rest of the session,
// which keeps hydrate() from ever rejecting and taking the Stimulus boot with it.
export const createLocalStorageAdapter = (): IStorageAdapter => {
  const fallback = createMemoryAdapter();
  let usable = true;

  return {
    get: (key) => {
      if (usable) {
        try {
          return Promise.resolve(localStorage.getItem(key));
        } catch {
          usable = false;
        }
      }
      return fallback.get(key);
    },
    set: (key, value) => {
      if (usable) {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch {
          usable = false;
        }
      }
      return fallback.set(key, value);
    },
  };
};
