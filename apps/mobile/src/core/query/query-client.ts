import { QueryClient } from "@tanstack/react-query";
import { experimental_createQueryPersister } from "@tanstack/react-query-persist-client";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "react-query:1" });

export const mmkvPersister = experimental_createQueryPersister({
  storage: {
    getItem: (key) => storage.getString(key),
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => {
      storage.remove(key);
    },
  },
  maxAge: 1000 * 60 * 60 * 24 * 90,
  refetchOnRestore: true,
});

export function clearPersistedQueries(): void {
  storage.clearAll();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 60 * 24 * 90,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      persister: mmkvPersister.persisterFn,
    },
  },
});
