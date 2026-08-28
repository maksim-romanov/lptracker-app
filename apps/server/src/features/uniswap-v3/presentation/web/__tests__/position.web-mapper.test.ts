import { deriveRangeTone, mapPositionToCardVM } from "../position.web-mapper";
import { describe, expect, it } from "bun:test";
import type { Position, TokensMap } from "#shared/contracts";

const tokens: TokensMap = {
  "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa": { symbol: "WETH", decimals: 18, iconUrl: "weth.png" },
  "1:0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb": { symbol: "USDC", decimals: 6, iconUrl: "usdc.png", displayDecimals: 2 },
};

const position = {
  ref: "uniswap-v3:1:42",
  address: "0xowner",
  chainId: 1,
  protocol: "uniswap-v3",
  container: { kind: "wallet", ref: "0xowner", label: "W" },
  tokens: [
    {
      role: "principal",
      tokenRef: "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      balance: { raw: "1000000000000000000", decimals: 18, formatted: "1.0", tokenRef: "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    },
    {
      role: "principal",
      tokenRef: "1:0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      balance: { raw: "2500000000", decimals: 6, formatted: "2500.0", tokenRef: "1:0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" },
    },
  ],
  status: { state: "in-range", stateDetail: null },
  createdAt: null,
  updatedAt: "2024-01-01T00:00:00Z",
  extension: {
    type: "uniswap-v3",
    version: 1,
    tickLower: -887220,
    tickUpper: 887220,
    liquidity: "1",
    feeTier: 3000,
    feeTierLabel: "0.3%",
    nftTokenId: "42",
    pool: { address: "0xpool", currentTick: 0, sqrtPriceX96: "1" },
  },
} as unknown as Position;

describe("mapPositionToCardVM", () => {
  it("maps base/quote in default (non-inverted) order", () => {
    const vm = mapPositionToCardVM(position, tokens, { inverted: false });
    expect(vm.ref).toBe("uniswap-v3:1:42");
    expect(vm.nftTokenId).toBe("42");
    expect(vm.feeTierLabel).toBe("0.3%");
    expect(vm.status).toBe("in-range");
    expect(vm.pair.base.symbol).toBe("WETH");
    expect(vm.pair.quote.symbol).toBe("USDC");
    expect(vm.principal.map((p) => p.symbol)).toEqual(["WETH", "USDC"]);
  });

  it("swaps base/quote and principal order when inverted", () => {
    const vm = mapPositionToCardVM(position, tokens, { inverted: true });
    expect(vm.pair.base.symbol).toBe("USDC");
    expect(vm.pair.quote.symbol).toBe("WETH");
    expect(vm.principal.map((p) => p.symbol)).toEqual(["USDC", "WETH"]);
  });

  it("formats token amounts with displayDecimals from token meta", () => {
    const vm = mapPositionToCardVM(position, tokens, { inverted: false });
    // USDC is a stablecoin → displayDecimals 2; formatTokenAmount must apply it.
    const usdc = vm.principal.find((p) => p.symbol === "USDC");
    expect(usdc?.formatted).toBe("2,500");
  });
});

// Only the three geometry fields matter here; the labels ride along untouched.
const bar = (thumbPct: number): Parameters<typeof deriveRangeTone>[1] =>
  ({ bandLeftPct: 20, bandWidthPct: 60, thumbPct }) as Parameters<typeof deriveRangeTone>[1];

describe("deriveRangeTone", () => {
  it("keeps a price away from either bound plain in-range", () => {
    expect(deriveRangeTone("in-range", bar(50))).toBe("in-range");
  });

  it("names the bound a price within a tenth of the band is approaching", () => {
    expect(deriveRangeTone("in-range", bar(24))).toBe("near-lower");
    expect(deriveRangeTone("in-range", bar(76))).toBe("near-upper");
  });

  it("treats the tenth as inclusive on both sides", () => {
    expect(deriveRangeTone("in-range", bar(26))).toBe("near-lower");
    expect(deriveRangeTone("in-range", bar(74))).toBe("near-upper");
    expect(deriveRangeTone("in-range", bar(27))).toBe("in-range");
    expect(deriveRangeTone("in-range", bar(73))).toBe("in-range");
  });

  it("passes a position that is not in range straight through", () => {
    // proximity is meaningless once the price has left the band, and closed positions
    // have no live price at all
    expect(deriveRangeTone("out-of-range", bar(95))).toBe("out-of-range");
    expect(deriveRangeTone("closed", bar(50))).toBe("closed");
  });
});
