import "reflect-metadata";

import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { container } from "tsyringe";

import { TokenMetaCache } from "../../data/token-meta.cache";
import { metaCacheKey } from "../../domain/types";
import { batchMetaBodySchema, type MetaParams, metaParamsSchema } from "../schemas/request.schemas";

export const routes = new Hono();

routes.get(
  "/chains/:chainId/tokens/:address/meta",
  describeRoute({
    tags: ["Token Meta"],
    summary: "Get name/symbol/decimals for a single token",
    responses: { 200: { description: "Token meta" }, 404: { description: "Not found" } },
  }),
  validator("param", metaParamsSchema),
  async (c) => {
    const { chainId, address } = c.req.valid("param") as MetaParams;
    const service = container.resolve(TokenMetaCache);
    const result = await service.getMeta([{ chainId, address }]);
    const meta = result.get(metaCacheKey(chainId, address));
    if (!meta) return c.json({ error: "Token meta not found" }, 404);
    return c.json(meta);
  },
);

routes.post(
  "/batch/meta",
  describeRoute({
    tags: ["Token Meta"],
    summary: "Batch meta lookup across chains",
    responses: { 200: { description: "Meta keyed by chainId:address.lower()" }, 400: { description: "Invalid body" } },
  }),
  validator("json", batchMetaBodySchema),
  async (c) => {
    const { tokens } = c.req.valid("json") as { tokens: Array<{ chainId: number; address: string }> };
    const service = container.resolve(TokenMetaCache);
    const result = await service.getMeta(tokens);
    const meta: Record<string, { name: string; symbol: string; decimals: number } | null> = {};
    for (const t of tokens) meta[metaCacheKey(t.chainId, t.address)] = result.get(metaCacheKey(t.chainId, t.address)) ?? null;
    return c.json({ meta });
  },
);
