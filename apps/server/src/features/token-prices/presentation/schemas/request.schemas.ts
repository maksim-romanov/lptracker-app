import * as v from "valibot";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const priceParamsSchema = v.object({
  chainId: v.pipe(
    v.string(),
    v.transform((val) => Number(val)),
    v.number(),
    v.integer(),
    v.minValue(1),
  ),
});

export const priceQuerySchema = v.object({
  addresses: v.pipe(
    v.string(),
    v.transform((val) => val.split(",")),
    v.array(v.pipe(v.string(), v.regex(ETH_ADDRESS_REGEX, "Must be a valid Ethereum address"))),
    v.minLength(1),
    v.maxLength(100),
  ),
});

export type PriceParams = v.InferOutput<typeof priceParamsSchema>;
export type PriceQuery = v.InferOutput<typeof priceQuerySchema>;
