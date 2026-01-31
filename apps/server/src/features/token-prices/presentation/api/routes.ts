import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { container } from "tsyringe";

import { TokenPriceCache } from "../../data/token-price.cache";
import { cacheKey } from "../../domain/types";
import { type PriceParams, type PriceQuery, priceParamsSchema, priceQuerySchema } from "../schemas/request.schemas";
import { pricesResponseSchema } from "../schemas/response.schemas";

export const routes = new Hono();

routes.get(
  "/chains/:chainId/tokens",
  describeRoute({
    tags: ["Token Prices"],
    summary: "Get token prices",
    description: "Fetches current USD prices for the specified tokens on a given chain",
    responses: {
      200: { description: "Token prices" },
      400: { description: "Invalid parameters" },
    },
  }),
  validator("param", priceParamsSchema),
  validator("query", priceQuerySchema),
  async (c) => {
    const { chainId } = c.req.valid("param") as PriceParams;
    const { addresses } = c.req.valid("query") as PriceQuery;

    const service = container.resolve(TokenPriceCache);
    const queries = addresses.map((address) => ({ chainId, address }));
    const priceMap = await service.getPrices(queries);

    const prices: Record<string, { priceUSD: number; confidence: number } | null> = {};
    for (const address of addresses) {
      const key = cacheKey(chainId, address);
      prices[address] = priceMap.get(key) ?? null;
    }

    return c.json({ prices });
  },
);
