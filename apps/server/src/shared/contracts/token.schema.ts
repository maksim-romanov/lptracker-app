import * as v from "valibot";

export const tokenRefSchema = v.pipe(
  v.string(),
  v.regex(/^\d+:0x[a-f0-9]{40}$/, "tokenRef must be in format '{chainId}:{lowercase-address}'"),
  v.metadata({ ref: "TokenRef" }),
);

export const tokenMetaSchema = v.pipe(
  v.object({
    symbol: v.string(),
    name: v.optional(v.string()),
    decimals: v.number(),
    iconUrl: v.string(),
    displayDecimals: v.optional(v.number()),
  }),
  v.metadata({ ref: "TokenMeta" }),
);

export const tokensMapSchema = v.pipe(v.record(tokenRefSchema, tokenMetaSchema), v.metadata({ ref: "TokensMap" }));

export type TokenRef = v.InferOutput<typeof tokenRefSchema>;
export type TokenMeta = v.InferOutput<typeof tokenMetaSchema>;
export type TokensMap = v.InferOutput<typeof tokensMapSchema>;

export const buildTokenRef = (chainId: number, address: string): TokenRef => `${chainId}:${address.toLowerCase()}` as TokenRef;
