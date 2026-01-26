import * as v from "valibot";

import { uniswapV3WrappedPositionSchema } from "../../features/uniswap-v3/presentation/schemas/response.schemas";

/**
 * Union of all protocol wrapped position schemas
 * Uses discriminated union on "protocol" field
 */
export const wrappedPositionSchema = v.variant("protocol", [
  uniswapV3WrappedPositionSchema,
  // Add other protocol schemas here as they are implemented
]);

/**
 * Response schema for all positions endpoint
 */
export const allPositionsResponseSchema = v.array(wrappedPositionSchema);

// Export types
export type WrappedPosition = v.InferOutput<typeof wrappedPositionSchema>;
export type AllPositionsResponse = v.InferOutput<typeof allPositionsResponseSchema>;
