import { shortAddress, WalletEntry } from "../wallet.entity";
import { describe, expect, it } from "bun:test";

const A = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
const B = "0x1234567890123456789012345678901234567890";
const upper = (addr: string): string => addr.toUpperCase().replace("0X", "0x");

describe("WalletEntry.create", () => {
  it("builds a lowercased entry from valid input", () => {
    const entry = WalletEntry.create(upper(A), [1, 8453], "watched");
    expect(entry?.address).toBe(A);
    expect(entry?.chainIds).toEqual([1, 8453]);
    expect(entry?.source).toBe("watched");
    expect(entry?.label).toBeNull();
  });

  it("returns null for an invalid address", () => {
    expect(WalletEntry.create("0xnope", [1], "watched")).toBeNull();
  });

  it("returns null when no chains are given", () => {
    expect(WalletEntry.create(A, [], "watched")).toBeNull();
  });

  it("does not alias the input chainIds array", () => {
    const chains = [1];
    const entry = WalletEntry.create(A, chains, "watched");
    chains.push(8453);
    expect(entry?.chainIds).toEqual([1]);
  });
});

describe("WalletEntry.parse / toString", () => {
  it("parses address:chains, lowercasing the address", () => {
    const entry = WalletEntry.parse(`${upper(A)}:1,8453`);
    expect(entry.address).toBe(A);
    expect(entry.chainIds).toEqual([1, 8453]);
  });

  it("toString renders the wire string and round-trips through parse", () => {
    expect(WalletEntry.create(A, [1], "watched")?.toString()).toBe(`${A}:1`);
    const entry = WalletEntry.parse(`${B}:137,42161`);
    expect(WalletEntry.parse(entry.toString()).chainIds).toEqual([137, 42161]);
  });

  // The nickname is the user's and the board has no business receiving it: the wire form the
  // server validates carries the address and its chains, and nothing else.
  it("keeps the nickname and the source out of the wire form", () => {
    expect(WalletEntry.create(A, [1], "connected", "Main Wallet")?.toString()).toBe(`${A}:1`);
  });
});

describe("WalletEntry storage form", () => {
  it("round-trips everything the wire form drops", () => {
    const entry = WalletEntry.create(A, [1, 8453], "connected", "Main Wallet");
    const restored = WalletEntry.fromStored(entry?.toStored());
    expect(restored?.source).toBe("connected");
    expect(restored?.label).toBe("Main Wallet");
    expect(restored?.chainIds).toEqual([1, 8453]);
  });

  // An entry written before wallets could be told apart is a pasted address by definition.
  it("reads a pre-migration string entry as watched", () => {
    const restored = WalletEntry.fromStored(`${A}:1,8453`);
    expect(restored?.source).toBe("watched");
    expect(restored?.chainIds).toEqual([1, 8453]);
  });

  it("rejects a stored value that is neither shape", () => {
    expect(WalletEntry.fromStored({ nope: true })).toBeNull();
    expect(WalletEntry.fromStored(null)).toBeNull();
  });
});

describe("displayName", () => {
  it("prefers the nickname and falls back to the shortened address", () => {
    expect(WalletEntry.create(A, [1], "watched", "Trading")?.displayName).toBe("Trading");
    expect(WalletEntry.create(A, [1], "watched")?.displayName).toBe(shortAddress(A));
  });
});

describe("shortAddress", () => {
  it("truncates the address for chip display", () => {
    expect(shortAddress(A)).toBe(`${A.slice(0, 6)}…${A.slice(-4)}`);
  });
});
