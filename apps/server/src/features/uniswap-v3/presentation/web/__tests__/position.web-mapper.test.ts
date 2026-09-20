import { formatPrice } from "@depthly/protocol-math/format";

import { mapPositionToCardVM } from "../position.web-mapper";
import { describe, expect, it } from "bun:test";
import { type ICardVM, type IPriceRangeVM, sortCardsByUrgency, type TPositionRangeTone } from "#presentation/web/views/positions/card.vm";
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
  feeAccrual: { mode: "unknown", reason: null, destination: null },
  yieldSources: [],
  // Full range, so both bounds are unbounded — the ticks below say the same thing.
  range: {
    lower: null,
    upper: null,
    current: "1000000000000",
    baseTokenRef: "1:0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    quoteTokenRef: "1:0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  },
  stats: [],
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

// The mapper refuses a v3 position with no range, so every card it does hand back has one.
const priceRangeOf = (source: Position, inverted: boolean): IPriceRangeVM => {
  const { priceRange } = mapPositionToCardVM(source, tokens, { inverted });
  if (!priceRange) throw new Error("mapPositionToCardVM returned a v3 card with no price range");
  return priceRange;
};

describe("mapPositionToCardVM", () => {
  it("maps base/quote in default (non-inverted) order", () => {
    const vm = mapPositionToCardVM(position, tokens, { inverted: false });
    expect(vm.ref).toBe("uniswap-v3:1:42");
    expect(vm.rangeTone).toBe("in-range");
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

  it("reads the price bounds off the contract's range rather than re-deriving them from ticks", () => {
    const bounded = {
      ...position,
      range: { ...(position.range as NonNullable<Position["range"]>), lower: "1800.5", upper: "2200.25", current: "1950.4" },
    } as Position;

    const priceRange = priceRangeOf(bounded, false);
    expect(priceRange.minLabel).toBe("1,800.50");
    expect(priceRange.currentLabel).toBe("1,950.40");
    expect(priceRange.maxLabel).toBe("2,200.25");
  });

  it("reads an unbounded side as zero and infinity, which is what a full-range position is", () => {
    const priceRange = priceRangeOf(position, false);
    expect(priceRange.minLabel).toBe("0");
    expect(priceRange.maxLabel).toBe("∞");
  });

  it("carries an unbounded side across an inversion, since one over an unbounded price is zero", () => {
    const oneSided = {
      ...position,
      range: { ...(position.range as NonNullable<Position["range"]>), lower: "1800.5", upper: null },
    } as Position;

    const priceRange = priceRangeOf(oneSided, true);
    expect(priceRange.minLabel).toBe("0");
    expect(priceRange.maxLabel).toBe(formatPrice(1 / 1800.5));
  });

  it("formats token amounts with displayDecimals from token meta", () => {
    const vm = mapPositionToCardVM(position, tokens, { inverted: false });
    // USDC is a stablecoin → displayDecimals 2; formatTokenAmount must apply it.
    const usdc = vm.principal.find((p) => p.symbol === "USDC");
    expect(usdc?.formatted).toBe("2,500");
  });
});

describe("the v3 facts the card needs are carried in protocol-neutral slots", () => {
  it("fills the venue, position and deep-link slots from the extension", () => {
    const vm = mapPositionToCardVM(position, tokens, { inverted: false });
    expect(vm.venueLabel).toBe("0.3%");
    expect(vm.positionLabel).toBe("#42");
    expect(vm.externalUrl).toBe("https://app.uniswap.org/positions/v3/ethereum/42");
  });

  it("sends an unlisted chain to a slug that 404s rather than to a real chain's", () => {
    // A link that opens on the wrong network is worse than one that does not open: it shows the
    // reader somebody else's positions and says nothing about being wrong.
    const unlisted = { ...position, ref: "uniswap-v3:130:42" } as Position;
    expect(mapPositionToCardVM(unlisted, tokens, { inverted: false }).externalUrl).toBe("https://app.uniswap.org/positions/v3/unknown/42");
  });

  it("gives a drained position an action tone rather than collapsing it into closed", () => {
    const drained = { ...position, status: { state: "drained", stateDetail: null } } as Position;
    expect(mapPositionToCardVM(drained, tokens, { inverted: false }).rangeTone).toBe("drained");
  });

  it("carries the states that are not about where the price sits straight through", () => {
    for (const state of ["out-of-range", "closed"] as const) {
      const at = { ...position, status: { state, stateDetail: null } } as Position;
      expect(mapPositionToCardVM(at, tokens, { inverted: false }).rangeTone).toBe(state);
    }
  });

  it("refuses a state it was not built for instead of painting it as live", () => {
    const unknown = { ...position, status: { state: "staked", stateDetail: null } } as Position;
    // The board counts a throwing mapper as unrenderable; guessing "in-range" would show a
    // position that earns nothing as one that does.
    expect(() => mapPositionToCardVM(unknown, tokens, { inverted: false })).toThrow(/unknown uniswap-v3 position state/);
  });
});

const cardWith = (ref: string, rangeTone: TPositionRangeTone): ICardVM => ({ ref, rangeTone }) as ICardVM;

describe("feeMode", () => {
  it("carries the mode verbatim, so redirected and compounded do not collapse into one another", () => {
    for (const mode of ["unknown", "claimable", "redirected", "compounded", "some-future-mode"]) {
      const withMode = { ...position, feeAccrual: { mode, reason: null, destination: null } } as Position;
      expect(mapPositionToCardVM(withMode, tokens, { inverted: false }).feeMode).toBe(mode);
    }
  });

  it("lists nothing owed when the pinned read failed, which is why the card has to carry the mode", () => {
    const vm = mapPositionToCardVM(position, tokens, { inverted: false });
    expect(vm.feeMode).toBe("unknown");
    expect(vm.owed).toEqual([]);
  });

  it("reads a position with no feeAccrual as unknown rather than throwing, for a server mid-rollout", () => {
    const { feeAccrual: _feeAccrual, ...withoutFeeAccrual } = position;
    expect(mapPositionToCardVM(withoutFeeAccrual as Position, tokens, { inverted: false }).feeMode).toBe("unknown");
  });
});

describe("sortCardsByUrgency", () => {
  it("leads with out-of-range, then near bounds, then in-range, then closed", () => {
    const cards = [cardWith("a", "closed"), cardWith("b", "in-range"), cardWith("c", "near-lower"), cardWith("d", "out-of-range")];
    expect(sortCardsByUrgency(cards).map((c) => c.ref)).toEqual(["d", "c", "b", "a"]);
  });

  it("treats near-lower and near-upper as the same urgency tier", () => {
    const cards = [cardWith("z-upper", "near-upper"), cardWith("a-lower", "near-lower")];
    // Same tier → falls through to the ref tie-break, not insertion order.
    expect(sortCardsByUrgency(cards).map((c) => c.ref)).toEqual(["a-lower", "z-upper"]);
  });

  it("breaks ties within a tier by ref for a stable order", () => {
    const cards = [cardWith("c", "in-range"), cardWith("a", "in-range"), cardWith("b", "in-range")];
    expect(sortCardsByUrgency(cards).map((c) => c.ref)).toEqual(["a", "b", "c"]);
  });

  it("does not mutate the input array", () => {
    const cards = [cardWith("b", "closed"), cardWith("a", "out-of-range")];
    const result = sortCardsByUrgency(cards);
    expect(result).not.toBe(cards);
    expect(cards.map((c) => c.ref)).toEqual(["b", "a"]);
  });
});
