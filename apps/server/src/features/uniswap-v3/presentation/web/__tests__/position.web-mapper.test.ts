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

// A ±10% band: 1,906 ticks wide. Narrower than the ~±19% at which the fixed 5% cap starts to
// bind, so its edge is a share of the range — 286 ticks, about a 2.9% move.
const TIGHT = { lower: -953, upper: 953 };
// A full-range position: the whole tick space, which is what every "max ∞" position looks like.
const FULL = { lower: -887220, upper: 887220 };

describe("deriveRangeTone", () => {
  it("keeps a price away from either bound plain in-range", () => {
    expect(deriveRangeTone("in-range", { ...TIGHT, current: 0 })).toBe("in-range");
  });

  it("names the bound a price is approaching", () => {
    expect(deriveRangeTone("in-range", { ...TIGHT, current: -800 })).toBe("near-lower");
    expect(deriveRangeTone("in-range", { ...TIGHT, current: 800 })).toBe("near-upper");
  });

  it("measures the edge in price, so a wide range is not permanently at its bound", () => {
    // A fraction-of-the-band rule put every full-range position at "near lower bound" for good:
    // a tenth of that span is a fifty-million-fold price move, so nothing could ever leave it.
    expect(deriveRangeTone("in-range", { ...FULL, current: -887220 + 5000 })).toBe("in-range");
    // Sitting a hair above the floor is still worth naming, whatever the span.
    expect(deriveRangeTone("in-range", { ...FULL, current: -887220 + 100 })).toBe("near-lower");
    expect(deriveRangeTone("in-range", { ...FULL, current: 887220 - 100 })).toBe("near-upper");
  });

  it("falls back to a share of the range when the range is narrower than the price threshold", () => {
    // A ±0.5% band is 200 ticks wide; a fixed 488 would cover it end to end and the warning
    // could never switch off.
    const narrow = { lower: -100, upper: 100 };
    expect(deriveRangeTone("in-range", { ...narrow, current: 0 })).toBe("in-range");
    expect(deriveRangeTone("in-range", { ...narrow, current: -90 })).toBe("near-lower");
  });

  it("names the bound the reader is looking at, which swaps when the pair is inverted", () => {
    const nearLower = { ...TIGHT, current: -800 };
    expect(deriveRangeTone("in-range", nearLower)).toBe("near-lower");
    expect(deriveRangeTone("in-range", nearLower, true)).toBe("near-upper");
  });

  it("passes a position that is not in range straight through", () => {
    // proximity is meaningless once the price has left the band, and closed positions
    // have no live price at all
    expect(deriveRangeTone("out-of-range", { ...TIGHT, current: 5000 })).toBe("out-of-range");
    expect(deriveRangeTone("closed", { ...TIGHT, current: 0 })).toBe("closed");
  });
});
