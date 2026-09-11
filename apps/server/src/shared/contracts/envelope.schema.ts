import * as v from "valibot";

import { tokensMapSchema } from "./token.schema";

export const partialFailureSchema = v.pipe(
  v.object({
    protocol: v.string(),
    chainId: v.number(),
    message: v.string(),
  }),
  v.metadata({ ref: "PartialFailure" }),
);

export const responseMetaSchema = v.pipe(v.object({ partialFailures: v.array(partialFailureSchema) }), v.metadata({ ref: "ResponseMeta" }));

export const listResponseSchema = <TItem extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(itemSchema: TItem) =>
  v.object({
    data: v.array(itemSchema),
    tokens: tokensMapSchema,
    meta: responseMetaSchema,
  });

export const detailResponseSchema = <TItem extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(itemSchema: TItem) =>
  v.object({
    data: itemSchema,
    tokens: tokensMapSchema,
  });

export type PartialFailure = v.InferOutput<typeof partialFailureSchema>;
export type ListResponse<T> = {
  data: T[];
  tokens: v.InferOutput<typeof tokensMapSchema>;
  meta: v.InferOutput<typeof responseMetaSchema>;
};
export type DetailResponse<T> = { data: T; tokens: v.InferOutput<typeof tokensMapSchema> };
