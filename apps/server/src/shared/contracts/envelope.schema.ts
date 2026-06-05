import * as v from "valibot";

import { pageSchema } from "./pagination.schema";
import { tokensMapSchema } from "./token.schema";

export const listResponseSchema = <TItem extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(itemSchema: TItem) =>
  v.object({
    data: v.array(itemSchema),
    tokens: tokensMapSchema,
    page: pageSchema,
  });

export const detailResponseSchema = <TItem extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(itemSchema: TItem) =>
  v.object({
    data: itemSchema,
    tokens: tokensMapSchema,
  });

export type ListResponse<T> = { data: T[]; tokens: v.InferOutput<typeof tokensMapSchema>; page: v.InferOutput<typeof pageSchema> };
export type DetailResponse<T> = { data: T; tokens: v.InferOutput<typeof tokensMapSchema> };
