import * as v from "valibot";

import { tokenRefSchema } from "./token.schema";

export const tokenAmountSchema = v.pipe(
  v.object({
    raw: v.pipe(v.string(), v.regex(/^-?\d+$/, "raw must be a base-10 integer string")),
    decimals: v.number(),
    formatted: v.string(),
    tokenRef: tokenRefSchema,
  }),
  v.metadata({ ref: "TokenAmount" }),
);

export type TokenAmount = v.InferOutput<typeof tokenAmountSchema>;
