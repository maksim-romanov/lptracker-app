import type { Position, TokenAmount } from "../index";
import { assertPositionInvariants } from "../invariants";
import { describe, expect, test } from "bun:test";

const amount = (tokenRef: string): TokenAmount => ({ raw: "1000", decimals: 18, formatted: "0.000000000000001", tokenRef });

const basePosition = (overrides: Partial<Position> = {}): Position => ({
  ref: "sample-protocol:1:1",
  address: "0xowner",
  chainId: 1,
  protocol: "sample-protocol",
  container: { kind: "pool", ref: "sample-protocol:1:0xpool", label: "A/B" },
  tokens: [],
  status: { state: "in-range", stateDetail: null },
  createdAt: null,
  updatedAt: "2024-01-01T00:00:00Z",
  feeAccrual: { mode: "claimable", reason: null, destination: null },
  yieldSources: [],
  range: null,
  stats: [],
  extension: { type: "sample-protocol", version: 1 },
  ...overrides,
});

describe("assertPositionInvariants", () => {
  test("rejects an owed balance on a position whose fees are redirected elsewhere", () => {
    const position = basePosition({
      feeAccrual: { mode: "redirected", reason: "gauge-staked", destination: "gauge-voters" },
      tokens: [{ role: "owed", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") }],
    });
    expect(() => assertPositionInvariants(position)).toThrow(/redirected/);
  });

  test("rejects an owed balance on a position whose fees compound into principal", () => {
    const position = basePosition({
      feeAccrual: { mode: "compounded", reason: "curve-virtual-price", destination: null },
      tokens: [{ role: "owed", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") }],
    });
    expect(() => assertPositionInvariants(position)).toThrow(/compounded/);
  });

  test("rejects an owed balance on a position that claims not to know where its fees go", () => {
    const position = basePosition({
      feeAccrual: { mode: "unknown", reason: "fee-read-unavailable", destination: null },
      tokens: [{ role: "owed", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") }],
    });
    expect(() => assertPositionInvariants(position)).toThrow(/unknown/);
  });

  test("allows an owed balance when fees are claimable", () => {
    const position = basePosition({ tokens: [{ role: "owed", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") }] });
    expect(() => assertPositionInvariants(position)).not.toThrow();
  });

  test("allows a non-claimable disposition as long as no owed token is listed", () => {
    const position = basePosition({
      feeAccrual: { mode: "compounded", reason: "curve-virtual-price", destination: null },
      tokens: [{ role: "principal", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") }],
    });
    expect(() => assertPositionInvariants(position)).not.toThrow();
  });

  test("rejects two principal entries for the same token, which a metapool expansion can produce", () => {
    const position = basePosition({
      tokens: [
        { role: "principal", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") },
        { role: "principal", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") },
      ],
    });
    expect(() => assertPositionInvariants(position)).toThrow(/principal/);
  });

  test("allows the same token under two different roles", () => {
    const position = basePosition({
      tokens: [
        { role: "principal", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") },
        { role: "owed", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") },
      ],
    });
    expect(() => assertPositionInvariants(position)).not.toThrow();
  });

  test("rejects a range whose bounds are the wrong way round, the signature of a pre-inverted pair", () => {
    const position = basePosition({
      range: { lower: "3000", upper: "1500", current: "2000", baseTokenRef: "1:0xaaa", quoteTokenRef: "1:0xbbb" },
    });
    expect(() => assertPositionInvariants(position)).toThrow(/upper/);
  });

  test("allows an ordered range", () => {
    const position = basePosition({
      range: { lower: "1500", upper: "3000", current: "2000", baseTokenRef: "1:0xaaa", quoteTokenRef: "1:0xbbb" },
    });
    expect(() => assertPositionInvariants(position)).not.toThrow();
  });

  test("allows equal bounds, which a single-tick range legitimately produces", () => {
    const position = basePosition({
      range: { lower: "2000", upper: "2000", current: "2000", baseTokenRef: "1:0xaaa", quoteTokenRef: "1:0xbbb" },
    });
    expect(() => assertPositionInvariants(position)).not.toThrow();
  });

  test("skips the comparison on an unbounded side, which has nothing to compare against", () => {
    const position = basePosition({
      range: { lower: null, upper: null, current: "2000", baseTokenRef: "1:0xaaa", quoteTokenRef: "1:0xbbb" },
    });
    expect(() => assertPositionInvariants(position)).not.toThrow();
  });

  test("names the duplicated ref, since the message is what a contributor debugs from", () => {
    const position = basePosition({
      tokens: [
        { role: "principal", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") },
        { role: "principal", tokenRef: "1:0xaaa", balance: amount("1:0xaaa") },
      ],
    });
    expect(() => assertPositionInvariants(position)).toThrow(/1:0xaaa/);
  });
});
