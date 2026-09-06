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

// `localStorage` access can throw outright (Safari private mode, Telegram webview, third-party
// iframes with cookies off), so it must be guarded; the first failure demotes the adapter to
// memory for the rest of the session.
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
