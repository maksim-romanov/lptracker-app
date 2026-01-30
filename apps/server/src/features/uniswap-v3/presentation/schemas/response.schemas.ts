import * as v from "valibot";

import { UNISWAP_V3_PROTOCOL } from "../../domain/constants/protocol";

const tokenAmountSchema = v.pipe(
  v.object({ value: v.number(), USDValue: v.number() }),
  v.metadata({ ref: "TokenAmount" }),
);

const tokenPairAmountSchema = v.pipe(
  v.object({ token0: tokenAmountSchema, token1: tokenAmountSchema }),
  v.metadata({ ref: "TokenPairAmount" }),
);

/**
 * Token entity schema
 */
export const tokenSchema = v.object({
  address: v.string(),
  symbol: v.string(),
  decimals: v.number(),
});

/**
 * Pool entity schema
 */
export const poolSchema = v.object({
  id: v.string(),
  feeTier: v.number(),
  currentTick: v.number(),
  sqrtPriceX96: v.string(),
  token0: tokenSchema,
  token1: tokenSchema,
});

/**
 * Position entity schema
 */
export const positionSchema = v.object({
  id: v.string(),
  tickLower: v.number(),
  tickUpper: v.number(),
  liquidity: tokenPairAmountSchema,
  pool: poolSchema,
  isActive: v.boolean(),
  isClosed: v.boolean(),
});

/**
 * Wrapped position schema with protocol discriminator
 */
export const uniswapV3WrappedPositionSchema = v.pipe(
  v.object({
    protocol: v.literal(UNISWAP_V3_PROTOCOL),
    chainId: v.number(),
    data: positionSchema,
  }),
  v.metadata({ ref: "UniswapV3Position" }),
);

/**
 * Position fees response schema
 */
export const positionFeesSchema = v.object({
  token0: tokenSchema,
  token1: tokenSchema,
  unclaimedFees: tokenPairAmountSchema,
});

/**
 * Error response schema
 */
export const errorResponseSchema = v.object({
  error: v.string(),
  code: v.string(),
  details: v.optional(v.record(v.string(), v.unknown())),
});

// Export types
export type Token = v.InferOutput<typeof tokenSchema>;
export type Pool = v.InferOutput<typeof poolSchema>;
export type Position = v.InferOutput<typeof positionSchema>;
export type UniswapV3WrappedPosition = v.InferOutput<typeof uniswapV3WrappedPositionSchema>;
export type PositionFees = v.InferOutput<typeof positionFeesSchema>;
export type ErrorResponse = v.InferOutput<typeof errorResponseSchema>;
