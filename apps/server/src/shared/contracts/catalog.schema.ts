import * as v from "valibot";

export const networkSchema = v.pipe(
  v.object({
    chainId: v.number(),
    slug: v.string(),
    name: v.string(),
    shortName: v.string(),
    nativeCurrency: v.object({
      symbol: v.string(),
      name: v.string(),
      decimals: v.number(),
    }),
    iconUrl: v.string(),
    explorerUrl: v.string(),
  }),
  v.metadata({ ref: "Network" }),
);

export const protocolSchema = v.pipe(
  v.object({
    slug: v.string(),
    name: v.string(),
    version: v.string(),
    supportedChainIds: v.array(v.number()),
    capabilities: v.array(v.string()),
    extensionVersion: v.string(),
  }),
  v.metadata({ ref: "Protocol" }),
);

export const catalogResponseSchema = v.pipe(
  v.object({
    networks: v.array(networkSchema),
    protocols: v.array(protocolSchema),
  }),
  v.metadata({ ref: "Catalog" }),
);

export type Network = v.InferOutput<typeof networkSchema>;
export type Protocol = v.InferOutput<typeof protocolSchema>;
export type CatalogResponse = v.InferOutput<typeof catalogResponseSchema>;
