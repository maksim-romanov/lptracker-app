import * as v from "valibot";

import { SUPPORTED_CHAIN_IDS, type SupportedChainId } from "../../features/uniswap-v3/presentation/schemas/request.schemas";

// Ethereum address validation regex
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Validates wallet address path parameter
 */
export const walletAddressParamSchema = v.object({
  walletAddress: v.pipe(v.string(), v.regex(ETH_ADDRESS_REGEX, "Must be a valid Ethereum address")),
});

/**
 * Validates query parameters for all positions endpoint
 */
export const getAllPositionsQuerySchema = v.object({
  limit: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => Number(val)),
      v.number(),
      v.integer(),
      v.minValue(1),
      v.maxValue(100),
    ),
    "10",
  ),
  offset: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => Number(val)),
      v.number(),
      v.integer(),
      v.minValue(0),
    ),
    "0",
  ),
  closed: v.optional(
    v.pipe(
      v.string(),
      v.transform((val) => val === "true" || val === "1"),
      v.boolean(),
    ),
    "false",
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
export type GetAllPositionsQuery = v.InferOutput<typeof getAllPositionsQuerySchema>;
