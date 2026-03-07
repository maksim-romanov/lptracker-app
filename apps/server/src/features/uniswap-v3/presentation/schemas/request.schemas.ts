import * as v from "valibot";

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = [1, 8453, 42161] as const;
export type SupportedChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

// Ethereum address validation regex
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Validates wallet address path parameter
 * Equivalent to WalletAddressParamDto
 */
export const walletAddressParamSchema = v.object({
  walletAddress: v.pipe(v.string(), v.regex(ETH_ADDRESS_REGEX, "Must be a valid Ethereum address")),
});

/**
 * Validates chain ID and position ID path parameters
 * Equivalent to ChainPositionParamDto
 */
export const chainPositionParamSchema = v.object({
  chainId: v.pipe(
    v.string(),
    v.transform((val) => Number(val) as SupportedChainId),
    v.picklist(SUPPORTED_CHAIN_IDS),
  ),
  id: v.pipe(v.string(), v.regex(/^\d+$/, "id must be a numeric string")),
});

/**
 * Validates query parameters for wallet positions endpoint
 * Equivalent to GetWalletPositionsQueryDto
 */
export const getWalletPositionsQuerySchema = v.object({
  limit: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => Number(val)),
      v.number(),
      v.integer(),
      v.minValue(1),
      v.maxValue(100),
    ),
    "10", // Default as string (will be transformed)
  ),
  offset: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => Number(val)),
      v.number(),
      v.integer(),
      v.minValue(0),
    ),
    "0", // Default as string
  ),
  closed: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => val === "true" || val === "1"),
      v.boolean(),
    ),
    "false", // Default as string
  ),
  chainIds: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => val.split(",").map(Number) as SupportedChainId[]),
      v.array(v.picklist(SUPPORTED_CHAIN_IDS)),
    ),
  ),
});

// Export types for use in handlers
export type WalletAddressParam = v.InferOutput<typeof walletAddressParamSchema>;
export type ChainPositionParam = v.InferOutput<typeof chainPositionParamSchema>;
export type GetWalletPositionsQuery = v.InferOutput<typeof getWalletPositionsQuerySchema>;
