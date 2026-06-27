import { CollectionStore } from "../collection.store";
import { WalletEntry } from "../wallet.entity";
import { walletStore } from "../wallet.store";
import { describe, expect, it } from "bun:test";

const A = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
const B = "0x1234567890123456789012345678901234567890";

const fakeStorage = () => {
  const kv: Record<string, string> = {};
  return {
    kv,
    adapter: {
      get: (k: string) => Promise.resolve(kv[k] ?? null),
      set: (k: string, v: string) => {
        kv[k] = v;
        return Promise.resolve();
      },
    },
  };
};

describe("WalletStore", () => {
  it("add dedupes by address (keeps existing) and persists", async () => {
    const { kv, adapter } = fakeStorage();
    CollectionStore.useAdapter(adapter);
    await walletStore.hydrate();

    walletStore.add(WalletEntry.parse(`${A}:1`));
    walletStore.add(WalletEntry.parse(`${A}:8453`)); // same address → ignored

    expect(walletStore.serialize()).toBe(`${A}:1`);
    expect(JSON.parse(kv.wallets ?? "[]")).toEqual([`${A}:1`]);
  });

  it("remove drops the entry by address (case-insensitive)", async () => {
    const { adapter } = fakeStorage();
    CollectionStore.useAdapter(adapter);
    await walletStore.hydrate();

    walletStore.add(WalletEntry.parse(`${A}:1`));
    walletStore.add(WalletEntry.parse(`${B}:137`));
    walletStore.remove(A.toUpperCase().replace("0X", "0x"));

    expect(walletStore.serialize()).toBe(`${B}:137`);
  });

  it("hydrate rebuilds the collection from storage", async () => {
    const { kv, adapter } = fakeStorage();
    kv.wallets = JSON.stringify([`${A}:1,8453`]);
    CollectionStore.useAdapter(adapter);
    await walletStore.hydrate();

    expect(walletStore.serialize()).toBe(`${A}:1,8453`);
  });

  it("list returns the entries for client-side chip rendering", async () => {
    const { adapter } = fakeStorage();
    CollectionStore.useAdapter(adapter);
    await walletStore.hydrate();

    walletStore.add(WalletEntry.parse(`${A}:1`));
    walletStore.add(WalletEntry.parse(`${B}:137`));

    expect(walletStore.list().map(String)).toEqual([`${A}:1`, `${B}:137`]);
  });
});
