import * as v from "valibot";

export const stableEntrySchema = v.pipe(
  v.object({
    chainId: v.number(),
    address: v.string(),
    symbol: v.string(),
  }),
  v.metadata({ ref: "StableEntry" }),
);

export const stablesResponseSchema = v.object({
  stables: v.array(stableEntrySchema),
});
