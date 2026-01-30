import * as v from "valibot";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const logoParamsSchema = v.object({
  chainId: v.pipe(
    v.string(),
    v.transform((val) => Number(val)),
    v.number(),
    v.integer(),
    v.minValue(1),
  ),
  address: v.pipe(v.string(), v.regex(ETH_ADDRESS_REGEX, "Must be a valid Ethereum address")),
});

export type LogoParams = v.InferOutput<typeof logoParamsSchema>;
