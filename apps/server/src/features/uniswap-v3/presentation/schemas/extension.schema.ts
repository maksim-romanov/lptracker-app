import * as v from "valibot";

export const UNISWAP_V3_EXTENSION_TYPE = "uniswap-v3" as const;

export const uniswapV3ExtensionPoolSchema = v.object({
  address: v.string(),
  currentTick: v.number(),
  sqrtPriceX96: v.string(),
  tickSpacing: v.optional(v.number()),
});

export const uniswapV3ExtensionSchema = v.pipe(
  v.object({
    type: v.literal(UNISWAP_V3_EXTENSION_TYPE),
    version: v.literal(1),
    tickLower: v.number(),
    tickUpper: v.number(),
    liquidity: v.string(),
    feeTier: v.number(),
    feeTierLabel: v.string(),
    nftTokenId: v.string(),
    pool: uniswapV3ExtensionPoolSchema,
  }),
  v.metadata({ ref: "UniswapV3Extension" }),
);

export type UniswapV3Extension = v.InferOutput<typeof uniswapV3ExtensionSchema>;
export type UniswapV3ExtensionPool = v.InferOutput<typeof uniswapV3ExtensionPoolSchema>;
