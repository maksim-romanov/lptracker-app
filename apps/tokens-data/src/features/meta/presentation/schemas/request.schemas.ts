import * as v from "valibot";

export const metaParamsSchema = v.object({
  chainId: v.pipe(v.string(), v.transform(Number), v.integer()),
  address: v.pipe(v.string(), v.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address")),
});
export type MetaParams = v.InferOutput<typeof metaParamsSchema>;

export const batchMetaBodySchema = v.object({
  tokens: v.array(v.object({ chainId: v.number(), address: v.string() })),
});
export type BatchMetaBody = v.InferOutput<typeof batchMetaBodySchema>;
