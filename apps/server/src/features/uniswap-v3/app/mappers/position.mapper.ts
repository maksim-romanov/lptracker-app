import { toDecimalString } from "@depthly/protocol-math/format";
import { priceRangeFromTicks } from "@depthly/protocol-math/uniswap-v3";
import { formatUnits } from "viem";

import type { PositionEntity } from "../../domain/entities/position.entity";
import type { TokenEntity } from "../../domain/entities/token.entity";
import { UNISWAP_V3_EXTENSION_TYPE, type UniswapV3Extension } from "../../presentation/schemas/extension.schema";
import { buildTokenRef, type MapPositionResult, type Position, type PositionRange, type TokenMetaInput } from "#shared/contracts";

export interface MapperOwedBalance {
  /** Raw owed amount for token0 as a base-10 integer string */
  token0Raw: string;
  /** Raw owed amount for token1 as a base-10 integer string */
  token1Raw: string;
}

export interface MapPositionInput {
  entity: PositionEntity;
  chainId: number;
  owed: MapperOwedBalance | null;
}

const formatFeeTierLabel = (feeTier: number): string => {
  const pct = feeTier / 10000;
  return `${pct < 0.01 ? pct.toFixed(4) : pct < 1 ? pct.toFixed(2) : pct.toFixed(2)}%`;
};

const buildPoolLabel = (token0: TokenEntity, token1: TokenEntity, feeTier: number): string =>
  `${token0.symbol}/${token1.symbol} ${formatFeeTierLabel(feeTier)}`;

const buildPositionRef = (chainId: number, nftTokenId: string): string => `uniswap-v3:${chainId}:${nftTokenId}`;

const buildPoolRef = (chainId: number, poolAddress: string): string => `uniswap-v3:${chainId}:${poolAddress.toLowerCase()}`;

// `burn()` reverts while either tokensOwed is non-zero, so zero liquidity does not mean the NFT
// is gone. With the owed read unavailable the two cannot be told apart, and calling it drained
// would assert an amount we never saw.
const deriveStatusState = (
  liquidity: bigint,
  hasOwedBalance: boolean,
  currentTick: number,
  tickLower: number,
  tickUpper: number,
): { state: string; stateDetail: string | null } => {
  if (liquidity === 0n) {
    if (hasOwedBalance) return { state: "drained", stateDetail: "liquidity withdrawn, balance still collectable" };
    return { state: "closed", stateDetail: null };
  }
  if (currentTick >= tickLower && currentTick < tickUpper) {
    return { state: "in-range", stateDetail: `tick ${currentTick} ∈ [${tickLower}, ${tickUpper})` };
  }
  return { state: "out-of-range", stateDetail: `tick ${currentTick} outside [${tickLower}, ${tickUpper})` };
};

const MIN_TICK = -887272;
const MAX_TICK = 887272;

// A full-range mint lands on nearestUsableTick(MIN_TICK, tickSpacing), never on MIN_TICK
// itself — -887220 at spacing 60, -887200 at spacing 200 — so an unbounded side cannot be one
// exact number. The width comes from the widest spacing any enabled v3 fee tier uses, and the
// window is safe to swallow whole: every tick inside it prices at about 1e-38, and even an
// 18-decimal shift leaves ~1e-20.
const WIDEST_TICK_SPACING = 200;

const isUnboundedLower = (tickLower: number): boolean => tickLower <= MIN_TICK + WIDEST_TICK_SPACING;
const isUnboundedUpper = (tickUpper: number): boolean => tickUpper >= MAX_TICK - WIDEST_TICK_SPACING;

// The round-trip through a fixed precision drops the exp/log artifacts `tickToPrice` leaves
// behind, so an exact 1e-12 ships as that rather than as 9.999999999999974e-13. Measured, the
// artifacts reach 5.8e-15 relative (an 18-decimal shift is the worst), which 15 and 14 digits
// do not absorb; 13 cuts at ~5e-13 and does. That is over eight orders finer than the 1e-4
// between adjacent ticks, so it cannot blur two prices into one.
const SIGNIFICANT_DIGITS = 13;

const toWirePrice = (value: number): string => toDecimalString(Number(value.toPrecision(SIGNIFICANT_DIGITS)));

// Base/quote follow the pool's own token order, so the price is token1 per token0 — the
// direction the tick sign already means. Inversion is a client-held display preference and
// is 1/x plus swapping the bounds, so it is not encoded here.
const buildRange = (entity: PositionEntity, tokenRef0: string, tokenRef1: string): PositionRange => {
  const { token0, token1, currentTick } = entity.pool;
  const { min, current, max } = priceRangeFromTicks({
    tickLower: entity.tickLower,
    tickUpper: entity.tickUpper,
    currentTick,
    baseDecimals: token0.decimals,
    quoteDecimals: token1.decimals,
    inverted: false,
  });

  return {
    lower: isUnboundedLower(entity.tickLower) ? null : toWirePrice(min),
    upper: isUnboundedUpper(entity.tickUpper) ? null : toWirePrice(max),
    current: toWirePrice(current),
    baseTokenRef: tokenRef0,
    quoteTokenRef: tokenRef1,
  };
};

const subgraphTimestampToIso = (positionId: string, field: string, timestamp: string): string => {
  if (!timestamp) {
    throw new Error(`V3 mapper: missing ${field} on position ${positionId}`);
  }
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) {
    throw new Error(`V3 mapper: non-finite ${field} '${timestamp}' on position ${positionId}`);
  }
  return new Date(seconds * 1000).toISOString();
};

export const mapV3PositionToContract = ({ entity, chainId, owed }: MapPositionInput): MapPositionResult => {
  const pool = entity.pool;
  const token0 = pool.token0;
  const token1 = pool.token1;

  const sdkPosition = entity.sdk;
  const amount0Raw = BigInt(sdkPosition.amount0.quotient.toString());
  const amount1Raw = BigInt(sdkPosition.amount1.quotient.toString());

  const tokenRef0 = buildTokenRef(chainId, token0.address);
  const tokenRef1 = buildTokenRef(chainId, token1.address);

  const positionTokens: Position["tokens"] = [
    {
      role: "principal",
      tokenRef: tokenRef0,
      balance: {
        raw: amount0Raw.toString(),
        decimals: token0.decimals,
        formatted: formatUnits(amount0Raw, token0.decimals),
        tokenRef: tokenRef0,
      },
    },
    {
      role: "principal",
      tokenRef: tokenRef1,
      balance: {
        raw: amount1Raw.toString(),
        decimals: token1.decimals,
        formatted: formatUnits(amount1Raw, token1.decimals),
        tokenRef: tokenRef1,
      },
    },
  ];

  const owed0 = owed ? BigInt(owed.token0Raw) : 0n;
  const owed1 = owed ? BigInt(owed.token1Raw) : 0n;
  const hasOwedBalance = owed0 > 0n || owed1 > 0n;

  // "owed", not "fee": `decreaseLiquidity` credits the withdrawn principal into the same
  // `tokensOwed` slot the fees land in, so this pair is what `collect()` pays out and not what
  // the position earned.
  if (owed && hasOwedBalance) {
    positionTokens.push(
      {
        role: "owed",
        tokenRef: tokenRef0,
        balance: {
          raw: owed.token0Raw,
          decimals: token0.decimals,
          formatted: formatUnits(owed0, token0.decimals),
          tokenRef: tokenRef0,
        },
      },
      {
        role: "owed",
        tokenRef: tokenRef1,
        balance: {
          raw: owed.token1Raw,
          decimals: token1.decimals,
          formatted: formatUnits(owed1, token1.decimals),
          tokenRef: tokenRef1,
        },
      },
    );
  }

  const extension: UniswapV3Extension = {
    type: UNISWAP_V3_EXTENSION_TYPE,
    version: 1,
    tickLower: entity.tickLower,
    tickUpper: entity.tickUpper,
    liquidity: entity.liquidity.toString(),
    feeTier: pool.feeTier,
    feeTierLabel: formatFeeTierLabel(pool.feeTier),
    nftTokenId: entity.id,
    pool: {
      address: pool.id,
      currentTick: pool.currentTick,
      sqrtPriceX96: pool.sqrtPriceX96,
    },
  };

  const { state, stateDetail } = deriveStatusState(entity.liquidity, hasOwedBalance, pool.currentTick, entity.tickLower, entity.tickUpper);

  const position: Position = {
    ref: buildPositionRef(chainId, entity.id),
    address: entity.owner.toLowerCase(),
    chainId,
    protocol: "uniswap-v3",
    protocolVersion: "3",
    container: {
      kind: "pool",
      ref: buildPoolRef(chainId, pool.id),
      label: buildPoolLabel(token0, token1, pool.feeTier),
    },
    tokens: positionTokens,
    status: { state, stateDetail },
    createdAt: subgraphTimestampToIso(entity.id, "createdAtTimestamp", entity.createdAtTimestamp),
    updatedAt: subgraphTimestampToIso(entity.id, "updatedAtTimestamp", entity.updatedAtTimestamp),
    // V3 fees sit outside principal and are collectable by the owner. A failed pinned read is
    // "unknown" rather than zero: the amount was never seen, so claiming it is none is a lie.
    feeAccrual: owed
      ? { mode: "claimable", reason: null, destination: null }
      : { mode: "unknown", reason: "fee-read-unavailable", destination: null },
    // V3 has no external emissions: everything the position earns accrues inside the pool.
    yieldSources: [],
    range: buildRange(entity, tokenRef0, tokenRef1),
    stats: [],
    extension,
  };

  const tokenMetaInputs: TokenMetaInput[] = [
    { chainId, address: token0.address, symbol: token0.symbol, decimals: token0.decimals },
    { chainId, address: token1.address, symbol: token1.symbol, decimals: token1.decimals },
  ];

  return { position, tokenMetaInputs };
};
