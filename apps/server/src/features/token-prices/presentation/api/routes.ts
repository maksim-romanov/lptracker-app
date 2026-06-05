import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { container } from "tsyringe";

import { TokensDataClient } from "../../../../shared/clients/tokens-data/client";
import { cacheKey } from "../../domain/types";
import { type PriceParams, type PriceQuery, priceParamsSchema, priceQuerySchema } from "../schemas/request.schemas";

export const routes = new Hono();

routes.get(
  "/chains/:chainId/tokens",
  describeRoute({
    tags: ["Token Prices (Deprecated)"],
    summary: "[Deprecated] Get token prices — use tokens-data /v1/batch/prices",
    responses: { 200: { description: "Token prices" }, 400: { description: "Invalid parameters" } },
  }),
  validator("param", priceParamsSchema),
  validator("query", priceQuerySchema),
  async (c) => {
    const { chainId } = c.req.valid("param") as PriceParams;
    const { addresses } = c.req.valid("query") as PriceQuery;

    const client = container.resolve(TokensDataClient);
    const response = await client.batchPrices(addresses.map((address) => ({ chainId, address })));

    const prices: Record<string, { priceUSD: number; confidence: number } | null> = {};
    for (const address of addresses) prices[address] = response.prices[cacheKey(chainId, address)] ?? null;

    c.header("Deprecation", "true");
    c.header("Link", `<${process.env.TOKENS_DATA_URL ?? "http://localhost:3100"}/v1/batch/prices>; rel="successor-version"`);
    return c.json({ prices });
  },
);
