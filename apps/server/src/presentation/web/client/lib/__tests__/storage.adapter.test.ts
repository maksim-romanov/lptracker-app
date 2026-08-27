import { createLocalStorageAdapter, createMemoryAdapter } from "../storage.adapter";
import { afterEach, describe, expect, it } from "bun:test";

const defineLocalStorage = (descriptor: PropertyDescriptor): void => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, ...descriptor });
};

// Storage that is blocked outright: touching the global throws rather than
// returning null (Telegram webview, Safari private mode, partitioned iframe).
const defineBlockedStorage = (): void =>
  defineLocalStorage({
    get() {
      throw new Error("access denied");
    },
  });

const defineWorkingStorage = (): Record<string, string> => {
  const backing: Record<string, string> = {};
  defineLocalStorage({
    value: {
      getItem: (key: string) => backing[key] ?? null,
      setItem: (key: string, value: string) => {
        backing[key] = value;
      },
    },
  });
  return backing;
};

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("createMemoryAdapter", () => {
  it("round-trips values and reports null for unknown keys", async () => {
    const adapter = createMemoryAdapter();

    await adapter.set("wallets", "a");

    expect(await adapter.get("wallets")).toBe("a");
    expect(await adapter.get("missing")).toBeNull();
  });
});

describe("createLocalStorageAdapter", () => {
  it("reads and writes through to localStorage when it is available", async () => {
    const backing = defineWorkingStorage();
    const adapter = createLocalStorageAdapter();

    await adapter.set("wallets", "0xabc:1");

    expect(backing.wallets).toBe("0xabc:1");
    expect(await adapter.get("wallets")).toBe("0xabc:1");
  });

  it("resolves instead of throwing when storage is blocked", async () => {
    defineBlockedStorage();
    const adapter = createLocalStorageAdapter();

    expect(await adapter.get("wallets")).toBeNull();
    await adapter.set("wallets", "0xabc:1");
  });

  it("degrades to memory for the rest of the session after the first failure", async () => {
    defineBlockedStorage();
    const adapter = createLocalStorageAdapter();

    await adapter.set("wallets", "0xabc:1");
    // Storage coming back mid-session must not resurrect it — the writes since the
    // failure only exist in memory, so reads have to keep coming from there.
    defineWorkingStorage();

    expect(await adapter.get("wallets")).toBe("0xabc:1");
  });
});
