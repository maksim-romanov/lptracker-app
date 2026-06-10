import type { TPositionByExt, TTokensMap } from "positions/domain/types";

import { buildWidgetSnapshot } from "../widget-snapshot.builder";
import { describe, expect, it } from "bun:test";

const wethPosition: TPositionByExt<"uniswap-v3"> = {
  ref: "uniswap-v3:1:12345",
  address: "0xabc",
  chainId: 1,
  protocol: "uniswap-v3",
  container: { kind: "pool", ref: "0xpool", label: "WETH / USDC 0.30%" },
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
    pool: { address: "0xpool", currentTick: 0, sqrtPriceX96: "1" },
  },
  createdAt: null,
  updatedAt: "2026-06-10T00:00:00.000Z",
};

const tokens: TTokensMap = {
  "1:0xweth": { symbol: "WETH", decimals: 18, iconUrl: "https://example.com/weth.png" },
  "1:0xusdc": { symbol: "USDC", decimals: 6, iconUrl: "https://example.com/usdc.png" },
};

describe("buildWidgetSnapshot", () => {
  it("filters positions to only those in the following set", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set(["uniswap-v3:1:99999"]),
      invertedRefs: new Set(),
      tokens,
      now: 1000,
    });
    expect(snapshot.positions).toEqual([]);
  });

  it("denormalizes principal and fee tokens with formatted balances and icons", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
      invertedRefs: new Set(),
      tokens,
      now: 1000,
    });
    const [p] = snapshot.positions;
    expect(p.principals).toEqual([
      { symbol: "WETH", iconUrl: "https://example.com/weth.png", formatted: "1" },
      { symbol: "USDC", iconUrl: "https://example.com/usdc.png", formatted: "1K" },
    ]);
    expect(p.fees).toEqual([{ symbol: "WETH", iconUrl: "https://example.com/weth.png", formatted: "0.01" }]);
  });

  it("derives pair.sym0/sym1 from the first two principal tokens", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
      invertedRefs: new Set(),
      tokens,
      now: 1000,
    });
    expect(snapshot.positions[0].pair).toEqual({
      sym0: "WETH",
      sym1: "USDC",
      icon0: "https://example.com/weth.png",
      icon1: "https://example.com/usdc.png",
    });
  });

  it("swaps pair when ref is in invertedRefs", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
      invertedRefs: new Set([wethPosition.ref]),
      tokens,
      now: 1000,
    });
    expect(snapshot.positions[0].pair).toEqual({
      sym0: "USDC",
      sym1: "WETH",
      icon0: "https://example.com/usdc.png",
      icon1: "https://example.com/weth.png",
    });
  });

  it("maps server status enum to widget status", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
      invertedRefs: new Set(),
      tokens,
      now: 1000,
    });
    expect(snapshot.positions[0].status).toBe("in-range");
  });

  it("emits uniswap-v3 extension with feeTierLabel and nftTokenId", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
      invertedRefs: new Set(),
      tokens,
      now: 1000,
    });
    expect(snapshot.positions[0].extension).toEqual({
      type: "uniswap-v3",
      feeTierLabel: "0.30%",
      nftTokenId: "12345",
      range: { tickLower: -887220, tickUpper: 887220, currentTick: 0 },
    });
  });

  it("stamps writtenAt with the now parameter and version 1", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
      invertedRefs: new Set(),
      tokens,
      now: 1717000000000,
    });
    expect(snapshot.v).toBe(1);
    expect(snapshot.writtenAt).toBe(1717000000000);
  });

  it("uses tokenRef as fallback symbol when token is missing from the map", () => {
    const orphan: TPositionByExt<"uniswap-v3"> = {
      ...wethPosition,
      ref: "uniswap-v3:1:orphan",
      tokens: [
        {
          role: "principal",
          tokenRef: "1:0xunknown",
          balance: { raw: "1", decimals: 18, formatted: "0.0", tokenRef: "1:0xunknown" },
        },
        ...wethPosition.tokens.slice(1),
      ],
    };
    const snapshot = buildWidgetSnapshot({
      positions: [orphan],
      following: new Set([orphan.ref]),
      invertedRefs: new Set(),
      tokens,
      now: 1000,
    });
    expect(snapshot.positions[0].principals[0].symbol).toBe("1:0xunknown");
    expect(snapshot.positions[0].principals[0].iconUrl).toBe("");
  });
});
