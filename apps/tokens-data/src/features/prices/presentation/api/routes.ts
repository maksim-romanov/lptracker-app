import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { container } from "tsyringe";
import * as v from "valibot";

import { TokenPriceCache } from "../../data/token-price.cache";
import { cacheKey } from "../../domain/types";
import { type PriceParams, type PriceQuery, priceParamsSchema, priceQuerySchema } from "../schemas/request.schemas";

export const routes = new Hono();

routes.get(
  "/chains/:chainId/tokens",
  describeRoute({
    tags: ["Token Prices"],
    summary: "Get token prices for a single chain",
    responses: { 200: { description: "Token prices" }, 400: { description: "Invalid parameters" } },
  }),
  validator("param", priceParamsSchema),
  validator("query", priceQuerySchema),
  async (c) => {
    const { chainId } = c.req.valid("param") as PriceParams;
    const { addresses } = c.req.valid("query") as PriceQuery;
    const service = container.resolve(TokenPriceCache);
    const priceMap = await service.getPrices(addresses.map((address) => ({ chainId, address })));
    const prices: Record<string, { priceUSD: number; confidence: number } | null> = {};
    for (const address of addresses) prices[address] = priceMap.get(cacheKey(chainId, address)) ?? null;
    return c.json({ prices });
  },
);

const batchPricesBodySchema = v.object({
  tokens: v.array(v.object({ chainId: v.number(), address: v.string() })),
});

routes.post(
  "/batch/prices",
  describeRoute({
    tags: ["Token Prices"],
    summary: "Get token prices across multiple chains in one batch",
    responses: { 200: { description: "Prices keyed by chainId:address.lower()" }, 400: { description: "Invalid body" } },
  }),
  validator("json", batchPricesBodySchema),
  async (c) => {
    const { tokens } = c.req.valid("json") as v.InferOutput<typeof batchPricesBodySchema>;
    const service = container.resolve(TokenPriceCache);
    const priceMap = await service.getPrices(tokens);
    const prices: Record<string, { priceUSD: number; confidence: number } | null> = {};
    for (const t of tokens) prices[cacheKey(t.chainId, t.address)] = priceMap.get(cacheKey(t.chainId, t.address)) ?? null;
    return c.json({ prices });
  },
);
