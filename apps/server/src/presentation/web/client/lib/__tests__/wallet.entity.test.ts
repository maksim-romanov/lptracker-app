import { WalletEntry } from "../wallet.entity";
import { describe, expect, it } from "bun:test";

const A = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
const B = "0x1234567890123456789012345678901234567890";
const upper = (addr: string): string => addr.toUpperCase().replace("0X", "0x");

describe("WalletEntry.create", () => {
  it("builds a lowercased entry from valid input", () => {
    const e = WalletEntry.create(upper(A), [1, 8453]);
    expect(e?.address).toBe(A);
    expect(e?.chainIds).toEqual([1, 8453]);
  });

  it("returns null for an invalid address", () => {
    expect(WalletEntry.create("0xnope", [1])).toBeNull();
  });

  it("returns null when no chains are given", () => {
    expect(WalletEntry.create(A, [])).toBeNull();
  });

  it("does not alias the input chainIds array", () => {
    const chains = [1];
    const e = WalletEntry.create(A, chains);
    chains.push(8453);
    expect(e?.chainIds).toEqual([1]);
  });
});

describe("WalletEntry.parse / toString", () => {
  it("parses address:chains, lowercasing the address", () => {
    const e = WalletEntry.parse(`${upper(A)}:1,8453`);
    expect(e.address).toBe(A);
    expect(e.chainIds).toEqual([1, 8453]);
  });

  it("toString renders the wire string and round-trips through parse", () => {
    expect(WalletEntry.create(A, [1])?.toString()).toBe(`${A}:1`);
    const e = WalletEntry.parse(`${B}:137,42161`);
    expect(WalletEntry.parse(e.toString()).chainIds).toEqual([137, 42161]);
  });

  it("is consumed implicitly by Array.join", () => {
    expect([WalletEntry.parse(`${A}:1`), WalletEntry.parse(`${B}:137`)].join("|")).toBe(`${A}:1|${B}:137`);
  });

  it("shortLabel truncates the address for chip display", () => {
    expect(WalletEntry.parse(`${A}:1`).shortLabel()).toBe(`${A.slice(0, 6)}…${A.slice(-4)}`);
  });
});
