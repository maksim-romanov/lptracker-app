import { configurePersistable } from "mobx-persist-store";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV();

configurePersistable({
  storage: {
    setItem: (key, data) => storage.set(key, data),
    getItem: (key) => storage.getString(key) || null,
    removeItem: (key) => {
      storage.remove(key);
    },
  },
});
