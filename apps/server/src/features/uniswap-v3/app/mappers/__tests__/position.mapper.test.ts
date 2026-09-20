import { TickMath } from "@uniswap/v3-sdk";

import { mapV3PositionToContract } from "../position.mapper";
import { describe, expect, it } from "bun:test";
import { PoolEntity } from "#features/uniswap-v3/domain/entities/pool.entity";
import { PositionEntity } from "#features/uniswap-v3/domain/entities/position.entity";
import { TokenEntity } from "#features/uniswap-v3/domain/entities/token.entity";
import { assertPositionInvariants } from "#shared/contracts";

const CHAIN_ID = 1;
const TOKEN0 = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const TOKEN1 = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const POOL = "0xcccccccccccccccccccccccccccccccccccccccc";

const MIN_TICK = -887272;
const MAX_TICK = 887272;
// nearestUsableTick(MIN_TICK, 60) — where every full-range 0.3% position actually sits.
const FULL_RANGE_LOWER_SPACING_60 = -887220;
const FULL_RANGE_UPPER_SPACING_60 = 887220;

interface PositionFixture {
  tickLower: number;
  tickUpper: number;
  currentTick?: number;
  feeTier?: number;
  liquidity?: string;
  decimals0?: number;
  decimals1?: number;
}

const buildEntity = ({
  tickLower,
  tickUpper,
  currentTick = 0,
  feeTier = 3000,
  liquidity = "1000000000000000000",
  decimals0 = 18,
  decimals1 = 18,
}: PositionFixture): PositionEntity => {
  const pool = new PoolEntity({
    chainId: CHAIN_ID,
    id: POOL,
    feeTier,
    liquidity,
    currentTick,
    sqrtPriceX96: TickMath.getSqrtRatioAtTick(currentTick).toString(),
    token0: new TokenEntity({ chainId: CHAIN_ID, address: TOKEN0, symbol: "AAA", decimals: decimals0 }),
    token1: new TokenEntity({ chainId: CHAIN_ID, address: TOKEN1, symbol: "BBB", decimals: decimals1 }),
  });

  return new PositionEntity({
    id: "42",
    owner: "0xOWNER",
    tickLower,
    tickUpper,
    liquidity,
    pool,
    createdAtTimestamp: "1700000000",
    updatedAtTimestamp: "1700000001",
  });
};

const OWED = { token0Raw: "1000", token1Raw: "2000" };
const NOTHING_OWED = { token0Raw: "0", token1Raw: "0" };

const mapWith = (fixture: PositionFixture, owed: typeof OWED | null = OWED) =>
  mapV3PositionToContract({ entity: buildEntity(fixture), chainId: CHAIN_ID, owed }).position;

describe("fee disposition", () => {
  it("says fees are claimable once the pinned read succeeded", () => {
    const position = mapWith({ tickLower: -60, tickUpper: 60 });

    expect(position.feeAccrual).toEqual({ mode: "claimable", reason: null, destination: null });
  });

  it("says it does not know rather than asserting claimable when the read is missing", () => {
    const position = mapWith({ tickLower: -60, tickUpper: 60 }, null);

    expect(position.feeAccrual).toEqual({ mode: "unknown", reason: "fee-read-unavailable", destination: null });
    expect(position.tokens.some((token) => token.role === "owed")).toBe(false);
  });

  it("carries no yield sources, since v3 pays nothing from outside the pool", () => {
    expect(mapWith({ tickLower: -60, tickUpper: 60 }).yieldSources).toEqual([]);
  });
});

describe("position status", () => {
  it("reports a drained position as still holding money rather than as closed", () => {
    const position = mapWith({ tickLower: -600, tickUpper: 600, liquidity: "0" });

    expect(position.status.state).toBe("drained");
    expect(position.tokens.filter((token) => token.role === "owed")).toHaveLength(2);
  });

  it("reports a settled position as closed once there is nothing left to collect", () => {
    const position = mapWith({ tickLower: -600, tickUpper: 600, liquidity: "0" }, NOTHING_OWED);

    expect(position.status.state).toBe("closed");
    expect(position.status.stateDetail).toBeNull();
  });

  it("does not claim drained on a fee read it never got", () => {
    const position = mapWith({ tickLower: -600, tickUpper: 600, liquidity: "0" }, null);

    expect(position.status.state).toBe("closed");
  });

  it("still reports the range state while liquidity is live", () => {
    expect(mapWith({ tickLower: -600, tickUpper: 600, currentTick: 0 }).status.state).toBe("in-range");
    expect(mapWith({ tickLower: -600, tickUpper: 600, currentTick: 900 }).status.state).toBe("out-of-range");
  });
});

describe("price range", () => {
  it("brackets the current price between the bounds of an in-range position", () => {
    const range = mapWith({ tickLower: -600, tickUpper: 600, currentTick: 0 }).range;

    expect(range).not.toBeNull();
    expect(Number(range?.lower)).toBeLessThan(Number(range?.current));
    expect(Number(range?.current)).toBeLessThan(Number(range?.upper));
  });

  it("follows the pool's own token order, so the price is token1 per token0", () => {
    const range = mapWith({ tickLower: -600, tickUpper: 600 }).range;

    expect(range?.baseTokenRef).toBe(`${CHAIN_ID}:${TOKEN0}`);
    expect(range?.quoteTokenRef).toBe(`${CHAIN_ID}:${TOKEN1}`);
  });

  it("applies the decimal difference, so the price is in human units rather than raw ones", () => {
    // 1.0001^0 * 10^(18-6) — a pool whose token0 has 12 more decimals than token1.
    const range = mapWith({ tickLower: -60, tickUpper: 60, decimals0: 18, decimals1: 6 }).range;

    expect(Number(range?.current)).toBeCloseTo(1e12, -6);
  });

  it("reports an unbounded side as null rather than as an astronomical number", () => {
    const range = mapWith({ tickLower: FULL_RANGE_LOWER_SPACING_60, tickUpper: FULL_RANGE_UPPER_SPACING_60 }).range;

    expect(range?.lower).toBeNull();
    expect(range?.upper).toBeNull();
    expect(range?.current).not.toBeNull();
  });

  it("recognizes the hard protocol limits a tickSpacing of 1 can reach", () => {
    const range = mapWith({ tickLower: MIN_TICK, tickUpper: MAX_TICK, feeTier: 100 }).range;

    expect(range?.lower).toBeNull();
    expect(range?.upper).toBeNull();
  });

  it("keeps a one-sided range one-sided", () => {
    const range = mapWith({ tickLower: MIN_TICK, tickUpper: 100, feeTier: 100 }).range;

    expect(range?.lower).toBeNull();
    expect(range?.upper).not.toBeNull();
  });

  it("spells out a price below the exponent threshold rather than emitting 1e-12", () => {
    // token0 with 12 fewer decimals than token1 puts the price near 1e-12, which
    // `Number.toString()` renders in exponent notation.
    const range = mapWith({ tickLower: -60, tickUpper: 60, decimals0: 6, decimals1: 18 }).range;

    for (const bound of [range?.lower, range?.upper, range?.current]) {
      expect(bound).not.toMatch(/e/i);
      expect(bound).toMatch(/^0\.0{11}\d+$/);
    }
    // Exactly 1e-12, not the 9.999999999999974e-13 that tickToPrice's exp/log leaves behind.
    expect(range?.current).toBe("0.000000000001");
  });

  it("clears the float artefact at the widest decimal shift, where it is largest", () => {
    // An 18-decimal gap is the worst case measured for tickToPrice's exp/log form: 5.8e-15
    // relative, which a 14- or 15-digit round-trip still leaves visible on the wire.
    const range = mapWith({ tickLower: -60, tickUpper: 60, decimals0: 0, decimals1: 18 }).range;

    expect(range?.current).toBe("0.000000000000000001");
  });

  it("spells out a price above the exponent threshold too", () => {
    const range = mapWith({ tickLower: 400000, tickUpper: 500000, currentTick: 450000, feeTier: 100, decimals0: 18, decimals1: 0 }).range;

    for (const bound of [range?.lower, range?.upper, range?.current]) {
      expect(bound).not.toMatch(/e/i);
      expect(bound).toMatch(/^\d{35,}(\.\d+)?$/);
    }
  });

  it("keeps the raw ticks in the extension, which is what a deep link needs", () => {
    const position = mapWith({ tickLower: -600, tickUpper: 600 });

    expect(position.extension.tickLower).toBe(-600);
    expect(position.extension.tickUpper).toBe(600);
  });
});

describe("contract invariants", () => {
  it("holds for a position whose fees were read", () => {
    expect(() => assertPositionInvariants(mapWith({ tickLower: -600, tickUpper: 600 }))).not.toThrow();
  });

  it("holds for a position whose fee read failed", () => {
    expect(() => assertPositionInvariants(mapWith({ tickLower: -600, tickUpper: 600 }, null))).not.toThrow();
  });

  it("holds for a settled position", () => {
    expect(() => assertPositionInvariants(mapWith({ tickLower: -600, tickUpper: 600, liquidity: "0" }, NOTHING_OWED))).not.toThrow();
  });

  it("holds for a drained position, whose fees outlive its liquidity", () => {
    expect(() => assertPositionInvariants(mapWith({ tickLower: -600, tickUpper: 600, liquidity: "0" }))).not.toThrow();
  });
});
