import type { TPositionByExt, TTokensMap } from "positions/domain/types";

import { mapToVm } from "../uniswap-v3.mapper";
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
      role: "owed",
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
  feeAccrual: { mode: "claimable", reason: null, destination: null },
  yieldSources: [],
  range: null,
  stats: [],
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

  it("keeps a drained position out of the closed bucket", () => {
    const vm = mapToVm({ ...fixture, status: { state: "drained", stateDetail: "liquidity withdrawn, fees still claimable" } }, tokens);
    expect(vm.status).toBe("drained");
  });

  it("carries an unrecognized state through as unknown rather than crashing the screen", () => {
    const unrecognized = { ...fixture, status: { state: "not-a-real-state", stateDetail: null } };
    expect(() => mapToVm(unrecognized, tokens)).not.toThrow();
    expect(mapToVm(unrecognized, tokens).status).toBe("unknown");
  });

  it("flags an unclaimed balance from the wire amount, which the display string cannot answer", () => {
    expect(mapToVm(fixture, tokens).hasUnclaimedBalance).toBe(true);

    const dusted = {
      ...fixture,
      tokens: fixture.tokens.map((token) =>
        token.role === "owed" ? { ...token, balance: { ...token.balance, raw: "1", formatted: "0.000000000000000001" } } : token,
      ),
    };
    expect(mapToVm(dusted, tokens).hasUnclaimedBalance).toBe(true);
    expect(Number(mapToVm(dusted, tokens).owed[0]?.formatted)).toBeNaN();
  });

  it("reports no unclaimed balance when the position carries no owed tokens", () => {
    const withoutOwed = { ...fixture, tokens: fixture.tokens.filter((token) => token.role !== "owed") };
    expect(mapToVm(withoutOwed, tokens).hasUnclaimedBalance).toBe(false);
  });

  it("carries feeAccrual.mode through verbatim, so a client can still tell the modes apart", () => {
    expect(mapToVm(fixture, tokens).feeMode).toBe("claimable");

    for (const mode of ["unknown", "redirected", "compounded", "some-future-mode"]) {
      const withMode = { ...fixture, feeAccrual: { mode, reason: null, destination: null } };
      expect(mapToVm(withMode, tokens).feeMode).toBe(mode);
    }
  });

  it("reads a position with no feeAccrual as unknown rather than throwing, for a server mid-rollout", () => {
    const { feeAccrual: _feeAccrual, ...withoutFeeAccrual } = fixture;
    expect(mapToVm(withoutFeeAccrual as typeof fixture, tokens).feeMode).toBe("unknown");
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

  it("aggregates owed tokens by role", () => {
    const vm = mapToVm(fixture, tokens);
    expect(vm.owed).toHaveLength(1);
    expect(vm.owed[0]?.symbol).toBe("WETH");
    expect(vm.owed[0]?.formatted).toBe("0.01");
    expect(vm.owed[0]?.iconUrl).toBe("https://example.com/weth.png");
  });

  it('ignores a legacy "fee" role, so a stale producer cannot smuggle a mixed balance in as fee income', () => {
    const legacy = { ...fixture, tokens: fixture.tokens.map((token) => (token.role === "owed" ? { ...token, role: "fee" } : token)) };
    expect(mapToVm(legacy, tokens).owed).toHaveLength(0);
    expect(mapToVm(legacy, tokens).hasUnclaimedBalance).toBe(false);
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
    expect(vm.priceRange.currentLabel).toMatch(/^([\d,.]+[KMBT]?|∞|0)$/);
  });
});
