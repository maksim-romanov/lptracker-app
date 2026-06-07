import type { TPositionByExt, TTokensMap } from "positions/domain/types";

import { formatPrice, mapToVm } from "../uniswap-v3.mapper";
import { describe, expect, it } from "bun:test";

const fixture: TPositionByExt<"uniswap-v3"> = {
  ref: "uniswap-v3:1:12345",
  address: "0xabc",
  chainId: 1,
  protocol: "uniswap-v3",
  container: { kind: "pool", ref: "0xpool", label: "WETH / USDC" },
  tokens: [
    {
      role: "principal",
      tokenRef: "1:0xweth",
      balance: { raw: "1000000000000000000", decimals: 18, formatted: "1.0", tokenRef: "1:0xweth" },
    },
    {
      role: "principal",
      tokenRef: "1:0xusdc",
      balance: { raw: "1000000000", decimals: 6, formatted: "1000.0", tokenRef: "1:0xusdc" },
    },
    {
      role: "fee",
      tokenRef: "1:0xweth",
      balance: { raw: "10000000000000000", decimals: 18, formatted: "0.01", tokenRef: "1:0xweth" },
    },
  ],
  status: { state: "in-range", stateDetail: null },
  extension: {
    type: "uniswap-v3",
    version: 1,
    tickLower: -887220,
    tickUpper: 887220,
    liquidity: "12345",
    feeTier: 3000,
    feeTierLabel: "0.30%",
    nftTokenId: "12345",
    pool: {
      address: "0xpool",
      currentTick: 0,
      sqrtPriceX96: "79228162514264337593543950336",
    },
  },
  createdAt: null,
  updatedAt: "2026-06-07T00:00:00.000Z",
};

const tokens: TTokensMap = {
  "1:0xweth": { symbol: "WETH", decimals: 18, iconUrl: "https://example.com/weth.png" },
  "1:0xusdc": { symbol: "USDC", decimals: 6, iconUrl: "https://example.com/usdc.png" },
};

describe("mapToVm (uniswap-v3)", () => {
  it("derives status from server position.status.state", () => {
    const vm = mapToVm(fixture, tokens);
    expect(vm.status).toBe("in-range");
  });

  it("reads feeTierLabel from server, not from feeBps client math", () => {
    const vm = mapToVm(fixture, tokens);
    expect(vm.feeTierLabel).toBe("0.30%");
  });

  it("aggregates principal tokens by role", () => {
    const vm = mapToVm(fixture, tokens);
    expect(vm.principal).toHaveLength(2);
    expect(vm.principal[0]).toEqual({
      tokenRef: "1:0xweth",
      symbol: "WETH",
      formatted: "1",
      iconUrl: "https://example.com/weth.png",
    });
    expect(vm.principal[1]).toEqual({
      tokenRef: "1:0xusdc",
      symbol: "USDC",
      formatted: "1,000",
      iconUrl: "https://example.com/usdc.png",
    });
  });

  it("aggregates fee tokens by role", () => {
    const vm = mapToVm(fixture, tokens);
    expect(vm.fees).toHaveLength(1);
    expect(vm.fees[0]?.symbol).toBe("WETH");
    expect(vm.fees[0]?.formatted).toBe("0.01");
    expect(vm.fees[0]?.iconUrl).toBe("https://example.com/weth.png");
  });

  it("exposes nftTokenId from extension", () => {
    const vm = mapToVm(fixture, tokens);
    expect(vm.nftTokenId).toBe("12345");
  });

  it("exposes pool address from extension.pool", () => {
    const vm = mapToVm(fixture, tokens);
    expect(vm.poolAddress).toBe("0xpool");
  });

  it("derives pair from first two principal tokens", () => {
    const vm = mapToVm(fixture, tokens);
    expect(vm.pair.base.symbol).toBe("WETH");
    expect(vm.pair.base.iconUrl).toBe("https://example.com/weth.png");
    expect(vm.pair.quote.symbol).toBe("USDC");
    expect(vm.pair.quote.iconUrl).toBe("https://example.com/usdc.png");
  });

  it("formats price range labels in quote-per-base units", () => {
    const vm = mapToVm(fixture, tokens);
    expect(vm.priceRange.baseSymbol).toBe("WETH");
    expect(vm.priceRange.quoteSymbol).toBe("USDC");
    expect(vm.priceRange.minLabel).not.toBe("-887220");
    expect(vm.priceRange.maxLabel).not.toBe("887220");
    expect(vm.priceRange.currentLabel).toMatch(/^[\d,.]+$/);
  });
});

describe("formatPrice", () => {
  it("formats large numbers with thousand separators and 2 decimals", () => {
    expect(formatPrice(3100)).toBe("3,100.00");
    expect(formatPrice(2700.456)).toBe("2,700.46");
  });

  it("formats mid-range numbers with 4 decimals", () => {
    expect(formatPrice(1.5)).toBe("1.5000");
    expect(formatPrice(42.1234567)).toBe("42.1235");
  });

  it("formats small numbers with 6 decimals", () => {
    expect(formatPrice(0.001234)).toBe("0.001234");
  });

  it("formats very small numbers with 8 decimals", () => {
    expect(formatPrice(0.00000387)).toBe("0.00000387");
  });

  it("uses exponential for extremely small numbers", () => {
    expect(formatPrice(1e-9)).toBe("1.00e-9");
  });

  it("returns em-dash for non-finite or non-positive input", () => {
    expect(formatPrice(0)).toBe("—");
    expect(formatPrice(-1)).toBe("—");
    expect(formatPrice(Number.NaN)).toBe("—");
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe("—");
  });
});
