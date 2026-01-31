import * as v from "valibot";

export const tokenPriceSchema = v.pipe(
  v.object({
    priceUSD: v.number(),
    confidence: v.number(),
  }),
  v.metadata({ ref: "TokenPriceResult" }),
);

export const pricesResponseSchema = v.object({
  prices: v.record(v.string(), v.nullable(tokenPriceSchema)),
});
