import * as v from "valibot";

export const tokenMetaSchema = v.object({
  name: v.string(),
  symbol: v.string(),
  decimals: v.number(),
});
export type TokenMetaResponse = v.InferOutput<typeof tokenMetaSchema>;

export const batchMetaResponseSchema = v.object({
  meta: v.record(v.string(), v.nullable(tokenMetaSchema)),
});
