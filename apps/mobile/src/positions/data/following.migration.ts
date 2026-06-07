import { createMMKV } from "react-native-mmkv";

import { FOLLOWING_MMKV_KEY } from "./following.repository";

const V2_KEY = "following:v2";

export function migrateFollowingV2ToV3(): void {
  const storage = createMMKV({ id: "following" });
  if (storage.getString(FOLLOWING_MMKV_KEY)) return;
  const v2 = storage.getString(V2_KEY);
  if (!v2) return;
  try {
    const oldArray = JSON.parse(v2);
    const refs: string[] = Array.isArray(oldArray)
      ? oldArray
          .map((entry) => {
            if (typeof entry === "string") return entry;
            if (entry && typeof entry === "object") {
              const { protocol, chainId, id } = entry as Record<string, unknown>;
              if (typeof protocol === "string" && typeof chainId === "number" && typeof id === "string") {
                return `${protocol}:${chainId}:${id}`;
              }
            }
            return null;
          })
          .filter((r): r is string => r !== null)
      : [];
    storage.set(FOLLOWING_MMKV_KEY, JSON.stringify(refs));
  } catch {
    // Swallow parse errors; user keeps their v2 blob intact.
  }
}
