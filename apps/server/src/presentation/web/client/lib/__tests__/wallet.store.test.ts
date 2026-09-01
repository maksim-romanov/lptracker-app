import { CollectionStore } from "../collection.store";
import { type TWalletSource, WalletEntry } from "../wallet.entity";
import { walletStore } from "../wallet.store";
import { beforeEach, describe, expect, it } from "bun:test";

const A = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
const B = "0x1234567890123456789012345678901234567890";
const C = "0x9999999999999999999999999999999999999999";

// Throws rather than asserting non-null: a fixture address that fails validation is a broken
// test, and the message says which one.
const entry = (address: string, chainIds: number[], source: TWalletSource): WalletEntry => {
  const created = WalletEntry.create(address, chainIds, source);
  if (!created) throw new Error(`invalid fixture wallet: ${address}`);
  return created;
};

const watched = (address: string, chainIds: number[] = [1]) => entry(address, chainIds, "watched");
const connected = (address: string) => entry(address, [1], "connected");

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

let storage: ReturnType<typeof fakeStorage>;

beforeEach(async () => {
  storage = fakeStorage();
  CollectionStore.useAdapter(storage.adapter);
  await walletStore.hydrate();
});

describe("WalletStore", () => {
  it("watch dedupes by address (keeps existing) and persists", () => {
    walletStore.watch(watched(A, [1]));
    walletStore.watch(watched(A, [8453])); // same address → ignored

    expect(walletStore.serialize()).toBe(`${A}:1`);
    expect(JSON.parse(storage.kv.wallets ?? "[]")).toEqual([{ address: A, chainIds: [1], source: "watched", label: null }]);
  });

  it("remove drops the entry by address (case-insensitive)", () => {
    walletStore.watch(watched(A));
    walletStore.watch(watched(B, [137]));
    walletStore.remove(A.toUpperCase().replace("0X", "0x"));

    expect(walletStore.serialize()).toBe(`${B}:137`);
  });

  it("hydrate rebuilds the collection from a pre-migration string list", async () => {
    storage.kv.wallets = JSON.stringify([`${A}:1,8453`]);
    await walletStore.hydrate();

    expect(walletStore.serialize()).toBe(`${A}:1,8453`);
    expect(walletStore.bySource("watched").map((entry) => entry.address)).toEqual([A]);
  });

  // Connecting a second wallet replaces the signer. It must not touch the watched addresses —
  // those were never signed into, and clearing the whole list is how this used to lose them.
  it("connect replaces only the signer and leaves watched addresses alone", () => {
    walletStore.watch(watched(A));
    walletStore.connect(connected(B));
    walletStore.connect(connected(C));

    expect(walletStore.bySource("connected").map((entry) => entry.address)).toEqual([C]);
    expect(walletStore.bySource("watched").map((entry) => entry.address)).toEqual([A]);
  });

  it("connect promotes an address that was already being watched, keeping its nickname", () => {
    walletStore.watch(watched(A));
    walletStore.rename(A, "Cold storage");
    walletStore.connect(connected(A));

    expect(walletStore.bySource("watched")).toEqual([]);
    const [signer] = walletStore.bySource("connected");
    expect(signer?.address).toBe(A);
    expect(signer?.label).toBe("Cold storage");
  });

  it("disconnect removes the signer and keeps everything else", () => {
    walletStore.watch(watched(A));
    walletStore.connect(connected(B));
    walletStore.disconnect();

    expect(walletStore.bySource("connected")).toEqual([]);
    expect(walletStore.serialize()).toBe(`${A}:1`);
  });

  it("rename stores a nickname and clears it back to null when blanked", () => {
    walletStore.watch(watched(A));
    walletStore.rename(A, "  Trading  ");
    expect(walletStore.list()[0]?.label).toBe("Trading");

    walletStore.rename(A, "   ");
    expect(walletStore.list()[0]?.label).toBeNull();
  });

  it("serialize carries the wire form only, never a nickname", () => {
    walletStore.connect(connected(A));
    walletStore.rename(A, "Main Wallet");

    expect(walletStore.serialize()).toBe(`${A}:1`);
  });

  it("list returns the entries for client-side chip rendering", () => {
    walletStore.watch(watched(A));
    walletStore.watch(watched(B, [137]));

    expect(walletStore.list().map(String)).toEqual([`${A}:1`, `${B}:137`]);
  });
});
