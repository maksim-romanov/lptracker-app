import type { TGatewayPosition, TPositionByExt, TTokensMap } from "positions/domain/types";

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
    pool: { address: "0xpool", currentTick: 0, sqrtPriceX96: "1" },
  },
  createdAt: null,
  updatedAt: "2026-06-10T00:00:00.000Z",
  feeAccrual: { mode: "claimable", reason: null, destination: null },
  yieldSources: [],
  range: {
    lower: "1600",
    upper: "2500",
    current: "2000",
    baseTokenRef: "1:0xweth",
    quoteTokenRef: "1:0xusdc",
  },
  stats: [],
};

const fullRangePosition: TPositionByExt<"uniswap-v3"> = {
  ...wethPosition,
  ref: "uniswap-v3:1:54321",
  range: { lower: null, upper: null, current: "2000", baseTokenRef: "1:0xweth", quoteTokenRef: "1:0xusdc" },
};

const rangelessPosition: TPositionByExt<"uniswap-v3"> = {
  ...wethPosition,
  ref: "uniswap-v3:1:67890",
  range: null,
};

const unknownExtensionPosition: TGatewayPosition = {
  ...wethPosition,
  ref: "not-a-real-protocol:1:99999",
  protocol: "not-a-real-protocol",
  extension: { type: "not-a-real-protocol", version: 1 },
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
      tokens,
      now: 1000,
    });
    expect(snapshot.positions).toEqual([]);
  });

  it("denormalizes principal and fee tokens with formatted balances and icons", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
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

  it("maps server status enum to widget status", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
      tokens,
      now: 1000,
    });
    expect(snapshot.positions[0].status).toBe("in-range");
  });

  it('holds a drained position at "closed" on purpose, until BOTH widget binaries that can decode the new state ship', () => {
    // Not a stale assertion: an installed WidgetStatus enum decodes the three values below and
    // nothing else, and SnapshotStore — Swift and Kotlin alike — turns a decode failure into a
    // blank widget for EVERY position, not just this one. So the wire keeps collapsing anything
    // newer until the wider enum is on phones — `staked` lands here for the same reason.
    // Adding an entry to STATUS_MAP is what breaks this test (widening TWidgetStatus alone
    // changes nothing it can observe), and the JS bundle reaches phones whose widget binary is
    // older on either platform: iOS AND Android must both have shipped before that entry lands.
    const drained = { ...wethPosition, status: { state: "drained", stateDetail: "liquidity withdrawn, fees still claimable" } };
    const staked = { ...wethPosition, ref: "uniswap-v3:1:99999", status: { state: "staked", stateDetail: null } };
    const snapshot = buildWidgetSnapshot({
      positions: [drained, staked],
      following: new Set([drained.ref, staked.ref]),
      tokens,
      now: 1000,
    });

    expect(snapshot.positions.map((position) => position.status)).toEqual(["closed", "closed"]);
  });

  it("hands the widget feeAccrual.mode verbatim, so redirected and compounded stay apart on the tile", () => {
    for (const mode of ["unknown", "claimable", "redirected", "compounded", "some-future-mode"]) {
      const position = { ...wethPosition, feeAccrual: { mode, reason: null, destination: null } };
      const snapshot = buildWidgetSnapshot({ positions: [position], following: new Set([position.ref]), tokens, now: 1000 });

      expect(snapshot.positions[0].feeMode).toBe(mode);
    }
  });

  it("writes the snapshot for a position missing feeAccrual instead of throwing and leaving every widget stale", () => {
    const { feeAccrual: _feeAccrual, ...withoutFeeAccrual } = wethPosition;
    const positions = [withoutFeeAccrual as typeof wethPosition];
    const snapshot = buildWidgetSnapshot({ positions, following: new Set([wethPosition.ref]), tokens, now: 1000 });

    expect(snapshot.positions).toHaveLength(1);
    expect(snapshot.positions[0].feeMode).toBe("unknown");
  });

  it("emits uniswap-v3 extension with feeTierLabel and nftTokenId", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
      tokens,
      now: 1000,
    });
    expect(snapshot.positions[0].extension).toEqual({
      type: "uniswap-v3",
      feeTierLabel: "0.30%",
      nftTokenId: "12345",
      priceRange: {
        quoted: {
          lower: "1600",
          upper: "2500",
          current: "2000",
          lowerLabel: "1600",
          upperLabel: "2500",
          currentLabel: "2000",
        },
        inverted: {
          lower: "0.0004",
          upper: "0.000625",
          current: "0.0005",
          lowerLabel: "0.0004",
          upperLabel: "0.000625",
          currentLabel: "0.0005",
        },
      },
    });
  });

  it("carries an unbounded bound through as null rather than dropping the range", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [fullRangePosition],
      following: new Set([fullRangePosition.ref]),
      tokens,
      now: 1000,
    });
    const extension = snapshot.positions[0].extension;
    if (extension.type !== "uniswap-v3") throw new Error("expected a uniswap-v3 extension");

    expect(extension.priceRange).toEqual({
      quoted: { lower: null, upper: null, current: "2000", lowerLabel: "0", upperLabel: "∞", currentLabel: "2000" },
      inverted: { lower: null, upper: null, current: "0.0005", lowerLabel: "0", upperLabel: "∞", currentLabel: "0.0005" },
    });
  });

  it("flips a zero bound to the unbounded end rather than leaving it at the bottom of the scale", () => {
    const zeroLower = { ...wethPosition, range: { ...wethPosition.range, lower: "0" } } as TPositionByExt<"uniswap-v3">;
    const snapshot = buildWidgetSnapshot({ positions: [zeroLower], following: new Set([zeroLower.ref]), tokens, now: 1000 });
    const extension = snapshot.positions[0].extension;
    if (extension.type !== "uniswap-v3") throw new Error("expected a uniswap-v3 extension");

    expect(extension.priceRange?.inverted.upper).toBeNull();
    expect(extension.priceRange?.inverted.upperLabel).toBe("∞");
  });

  it("keeps an inverted bound a plain decimal string, the way the contract states range values", () => {
    const tiny = { ...wethPosition, range: { ...wethPosition.range, upper: "10000000" } } as TPositionByExt<"uniswap-v3">;
    const snapshot = buildWidgetSnapshot({ positions: [tiny], following: new Set([tiny.ref]), tokens, now: 1000 });
    const extension = snapshot.positions[0].extension;
    if (extension.type !== "uniswap-v3") throw new Error("expected a uniswap-v3 extension");

    expect(extension.priceRange?.inverted.lower).toBe("0.0000001");
  });

  it("does not turn an unparseable current price into infinity, which would pin the thumb at the far right", () => {
    const broken = { ...wethPosition, range: { ...wethPosition.range, current: "not-a-price" } } as TPositionByExt<"uniswap-v3">;
    const snapshot = buildWidgetSnapshot({ positions: [broken], following: new Set([broken.ref]), tokens, now: 1000 });
    const extension = snapshot.positions[0].extension;
    if (extension.type !== "uniswap-v3") throw new Error("expected a uniswap-v3 extension");

    expect(extension.priceRange?.inverted.current).toBe("not-a-price");
    expect(extension.priceRange?.inverted.currentLabel).toBe("—");
    expect(extension.priceRange?.quoted.currentLabel).toBe("—");
  });

  it("does not turn an unparseable bound into an unbounded one, which would draw it at an end of the scale", () => {
    const broken = { ...wethPosition, range: { ...wethPosition.range, lower: "not-a-price" } } as TPositionByExt<"uniswap-v3">;
    const snapshot = buildWidgetSnapshot({ positions: [broken], following: new Set([broken.ref]), tokens, now: 1000 });
    const extension = snapshot.positions[0].extension;
    if (extension.type !== "uniswap-v3") throw new Error("expected a uniswap-v3 extension");

    expect(extension.priceRange?.quoted.lower).toBe("not-a-price");
    expect(extension.priceRange?.inverted.upper).toBe("not-a-price");
    expect(extension.priceRange?.inverted.upperLabel).toBe("—");
  });

  it("emits a null price range when the contract carries none", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [rangelessPosition],
      following: new Set([rangelessPosition.ref]),
      tokens,
      now: 1000,
    });
    const extension = snapshot.positions[0].extension;
    if (extension.type !== "uniswap-v3") throw new Error("expected a uniswap-v3 extension");

    expect(extension.priceRange).toBeNull();
  });

  it("stamps writtenAt with the now parameter and version 1", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition],
      following: new Set([wethPosition.ref]),
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
      tokens,
      now: 1000,
    });
    expect(snapshot.positions[0].principals[0].symbol).toBe("1:0xunknown");
    expect(snapshot.positions[0].principals[0].iconUrl).toBe("");
  });

  it("keeps a position whose extension type is not recognized", () => {
    const snapshot = buildWidgetSnapshot({
      positions: [wethPosition, unknownExtensionPosition],
      tokens,
      following: new Set([wethPosition.ref, unknownExtensionPosition.ref]),
      now: 1_700_000_000,
    });

    expect(snapshot.positions).toHaveLength(2);
    expect(snapshot.positions[1]?.extension).toEqual({ type: "unknown", raw: "not-a-real-protocol" });
  });
});
